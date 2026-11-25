import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { CuotaMensual, MetodoPago } from './cuotaMensual.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { ReservaInfraestructura, EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { CUOTA_BASE_CLUB } from '../config/cuotas.config.js';
import { Preference } from 'mercadopago';
import { mpClient } from '../config/mercadopago.config.js';
import 'dotenv/config';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import {
  MercadoPagoValidationError,
  registerManualCashPayment,
} from './cuotaMensual.payment.service.js';
import { sendHttpError } from '../shared/http-errors.js';
const em = orm.em;

function sanitizeCuotaMensualInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fechaVencimiento: req.body.fechaVencimiento,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) delete req.body.sanitizedInput[key];
  });
  next();
}

async function generarCuotasDelMes(req: Request, res: Response) {
  try {
    const mes = Number(req.body.mes) || new Date().getMonth() + 1;
    const anio = Number(req.body.anio) || new Date().getFullYear();
    const fechaVencimiento = new Date(anio, mes, 10); // vence el 10 del mes siguiente (chequear) 

    const resultado = await em.transactional(async (em) => {

      const socios = await em.find(Socio, {afiliaciones: {fechaFin: null}}); //(activos)

      const cuotasCreadas: CuotaMensual[] = [];
      const cuotasOmitidas: number[] = [];

      for (const socio of socios) {
        const yaExiste = await em.findOne(CuotaMensual, {
          socio: socio.id,
          mes,
          anio,
        });
        if (yaExiste) {
          cuotasOmitidas.push(socio.id!);
          continue;
        }

        const cuota = em.create(CuotaMensual, {
          mes,
          anio,
          fechaVencimiento,
          pagada: false,
          monto: 0, // se recalcula abajo
          socio,
        });

        // Detalle 1: cuota base del club
        const detalleBase = em.create(DetalleCuota, {
          concepto: 'Cuota base del club',
          monto: CUOTA_BASE_CLUB,
          cuota,
        });
        em.persist(detalleBase);

        // Detalle 2..N: reservas de infraestructura activas del socio
        const reservasActivas = await em.find(
          ReservaInfraestructura,
          {
            socio: socio.id,
            estado: EstadoReservaInfraestructura.ACTIVA,
          },
          { populate: ['amarra', 'box'] },
        );

        let totalReservas = 0;
        for (const reserva of reservasActivas) {
          const concepto = reserva.amarra ? `Amarra Nro ${reserva.amarra.id}` : reserva.box   ? `Box Nro ${reserva.box.id}`   : 'Infraestructura';
          const detalleReserva = em.create(DetalleCuota, {
            concepto,
            monto: reserva.precioMensualFinal,
            cuota,
            reservaInfraestructura: reserva,
          });
          em.persist(detalleReserva);
          totalReservas += Number(reserva.precioMensualFinal);
        }

        cuota.monto = CUOTA_BASE_CLUB + totalReservas;
        em.persist(cuota);
        cuotasCreadas.push(cuota);
      }

      return { cuotasCreadas, cuotasOmitidas };
    });

    res.status(201).json({
      message: `Se generaron ${resultado.cuotasCreadas.length} cuotas. Se omitieron ${resultado.cuotasOmitidas.length} (ya existían).`,
      data: resultado.cuotasCreadas,
    });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

// POST /cuotas/:id/mercadopago/preferencia
async function crearPreferenciaMP(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuota = await em.findOneOrFail(CuotaMensual, { id }, { populate: ['socio', 'detalles'] });
    const user = (req as AuthenticatedRequest).user;
    if (user.tipo === 'socio' && String(cuota.socio.id) !== String(user.id)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    if (cuota.pagada) {
      return res.status(409).json({ message: 'Esta cuota ya está pagada' });
    }

    const detalles = cuota.detalles.getItems();
    const items =
      detalles.length > 0
        ? detalles.map((d) => ({
            id: String(d.id),
            title: d.concepto,
            quantity: 1,
            unit_price: Number(d.monto),
            currency_id: 'ARS',
          }))
        : [
            {
              id: String(cuota.id),
              title: `Cuota ${cuota.mes}/${cuota.anio}`,
              quantity: 1,
              unit_price: Number(cuota.monto),
              currency_id: 'ARS',
            },
          ];

    const preference = new Preference(mpClient);
    const notificationUrl =`${process.env.BACKEND_URL}/api/webhooks/mercadopago`;

    console.log('WEBHOOK URL:', notificationUrl); 
    const resultado = await preference.create({
      body: {
        items,
        external_reference: String(cuota.id),
        payer: {
          name: cuota.socio.nombre,
          surname: cuota.socio.apellido,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago/exito`,
          failure: `${process.env.FRONTEND_URL}/pago/error`,
          pending: `${process.env.FRONTEND_URL}/pago/pendiente`,
        },
        notification_url: notificationUrl, 
      },
    });

    cuota.mercadoPagoPreferenceId = resultado.id;
    console.log('Preference ID:', resultado.id);
    console.log('Init point:', resultado.init_point);
    console.log('Sandbox init point:', resultado.sandbox_init_point);
    console.log('Webhook URL:', notificationUrl);
    console.log('CUOTA:', cuota.id);
    await em.flush();

    // Con credenciales de testeo hay que usar sandbox_init_point, no init_point -------> Lo cambie porque es sandbox es lo peor que se invento en la historia
    //a ver que tal
    const checkoutUrl =
      resultado.sandbox_init_point ?? resultado.init_point;

    res.status(200).json({ message: 'Preferencia creada', data: { checkoutUrl } });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function registrarPago(req: Request, res: Response){ //para registrar pago manual (en efectivo, por ej)

  try {
    const id = Number.parseInt(req.params.id);
    const user = (req as AuthenticatedRequest).user;

    if (req.body.pagada !== true) {
      return res.status(400).json({
        message: 'El registro manual solo permite marcar una cuota como pagada',
      });
    }

    if (
      req.body.metodoPago !== undefined &&
      req.body.metodoPago !== MetodoPago.EFECTIVO
    ) {
      return res.status(400).json({
        message: 'Los pagos manuales deben registrarse como efectivo',
      });
    }

    const fechaPago = req.body.fechaPago
      ? new Date(req.body.fechaPago)
      : new Date();
    if (Number.isNaN(fechaPago.getTime())) {
      return res.status(400).json({ message: 'La fecha de pago es inválida' });
    }

    const cuota = await registerManualCashPayment(id, user.id, fechaPago);
    res.status(200).json({
      message: 'La cuota fue marcada como pagada con éxito',
      data: cuota,
    });
    
  } catch (error: any) {
    if (error instanceof MercadoPagoValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.name === 'NotFoundError') return res.status(404).json({ message: 'Cuota no encontrada' });
    sendHttpError(error, req, res);
  }

}


async function findAll(req: Request, res: Response) {
  try{
    const cuotasMensuales = await em.find(CuotaMensual, {}, {populate: ['socio', 'detalles'] }); 
    res.status(200).json({message: 'found all cuotas mensuales', data: cuotasMensuales});
  }catch (error:any) {
    sendHttpError(error, req, res);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuotaMensual = await em.findOneOrFail(CuotaMensual, { id }, {populate: ['socio', 'detalles'] });
    res.status(200).json({message: 'found cuota mensual', data: cuotaMensual});
  } catch (error: any) {
    sendHttpError(error, req, res);
    
  }
}




async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuotaMensualToUpdate = await em.findOneOrFail(CuotaMensual, { id });

    em.assign(cuotaMensualToUpdate, req.body.sanitizedInput);

    await em.flush(); 

    res.status(200).json({ message: 'Cuota mensual updated', data: cuotaMensualToUpdate });
  } catch (error: any) {
    return sendHttpError(error, req, res);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuotaMensual = await em.findOneOrFail(CuotaMensual, {id}, {populate: ['detalles']})
    if (cuotaMensual.pagada) {
      return res.status(409).json({ message: 'No se puede eliminar una cuota ya pagada' });
    }
    em.remove(cuotaMensual);
    await em.flush();
    res.status(200).json({ message: 'Cuota mensual eliminada' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Cuota mensual no encontrada' });
    }
    return sendHttpError(error, req, res);
    }
}

async function findBySocio(req: Request, res: Response) {
  try {
    const idSocio = Number.parseInt(req.params.id);
    const cuotas = await em.find(CuotaMensual, { socio: idSocio }, { populate: ['detalles'], orderBy: {anio: 'desc', mes: 'desc'} });
    res.status(200).json({ message: 'Cuotas del socio encontradas', data: cuotas });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}


export { sanitizeCuotaMensualInput, findAll, findOne, update, remove, findBySocio, generarCuotasDelMes, registrarPago, crearPreferenciaMP };