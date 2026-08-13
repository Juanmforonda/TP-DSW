import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { CuotaMensual, MetodoPago } from './cuotaMensual.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { ReservaInfraestructura, EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { CUOTA_BASE_CLUB } from '../config/cuotas.config.js';
import { Preference, Payment } from 'mercadopago';
import { mpClient } from '../config/mercadopago.config.js';
import 'dotenv/config';
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
    res.status(500).json({ message: error.message });
  }
}

async function aplicarPagoAprobado(cuota: CuotaMensual, paymentId: string) {
  if (cuota.pagada) return; 
  cuota.pagada = true;
  cuota.metodoPago = MetodoPago.MERCADO_PAGO;
  cuota.fechaPago = new Date();
  cuota.mercadoPagoPaymentId = paymentId;
  await em.flush();
}

// POST /cuotas/:id/mercadopago/preferencia
async function crearPreferenciaMP(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuota = await em.findOneOrFail(CuotaMensual, { id }, { populate: ['socio', 'detalles'] });

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
    const backUrls = {
      success: `${process.env.FRONTEND_URL}/socio/cuotas`,
      failure: `${process.env.FRONTEND_URL}/socio/cuotas`,
      pending: `${process.env.FRONTEND_URL}/socio/cuotas`,
    };
    console.log('back_urls a enviar:', backUrls);
    const resultado = await preference.create({
      body: {
        items,
        external_reference: String(cuota.id),
        payer: {
          name: cuota.socio.nombre,
          surname: cuota.socio.apellido,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/socio`,
          failure: `${process.env.FRONTEND_URL}/socio`,
          pending: `${process.env.FRONTEND_URL}/socio`,
        },
        
        notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,  //la webhook solo sirve en produccion
      },
    });

    cuota.mercadoPagoPreferenceId = resultado.id;
    await em.flush();

    // Con credenciales de testeo hay que usar sandbox_init_point, no init_point
    const checkoutUrl = resultado.init_point ?? resultado.sandbox_init_point;

    res.status(200).json({ message: 'Preferencia creada', data: { checkoutUrl } });
  } catch (error: any) {
    console.error('Error en crearPreferenciaMP:', error);
    console.error('Detalle MP (si existe):', error?.cause ?? error?.response?.data ?? 'sin detalle adicional');
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// POST /cuotas/mercadopago/confirmar   body: { paymentId }
// Lo llama el frontend cuando el socio vuelve del checkout, para que ande en local
async function confirmarPagoMP(req: Request, res: Response) {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: 'Falta paymentId' });

    const paymentClient = new Payment(mpClient);
    const pagoInfo = await paymentClient.get({ id: String(paymentId) });

    const cuotaId = Number(pagoInfo.external_reference);
    const cuota = await em.findOneOrFail(CuotaMensual, { id: cuotaId });

    if (pagoInfo.status === 'approved') {
      await aplicarPagoAprobado(cuota, String(pagoInfo.id));
    }

    res.status(200).json({ message: 'Estado verificado', data: cuota });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

async function registrarPago(req: Request, res: Response){ //para registrar pago manual (en efectivo, por ej)

  try {
    const id = Number.parseInt(req.params.id);
    const cuota = await em.findOneOrFail(CuotaMensual, {id},);
    const {pagada} = req.body;

    if (pagada){
      if (cuota.pagada){
        return res.status(409).json({message: 'La cuota ya esta pagada'})
      }
      cuota.pagada = true;
      cuota.metodoPago = req.body.metodoPago === MetodoPago.MERCADO_PAGO ? MetodoPago.MERCADO_PAGO : MetodoPago.EFECTIVO;
      cuota.fechaPago = req.body.fechaPago ? new Date(req.body.fechaPago) : new Date();
    }
    else{
      cuota.pagada = false;
      cuota.metodoPago = undefined;
      cuota.fechaPago = undefined;
    }
    await em.flush();
    res.status(200).json({message: pagada ? 'La cuota fue marcada como pagada con exito' : 'Se saco el dato de la cuota pagada', data: cuota})
    
  } catch (error: any) {
    if (error.name === 'NotFoundError') return res.status(404).json({ message: 'Cuota no encontrada' });
    res.status(500).json({ message: error.message });
  }

}


async function findAll(req: Request, res: Response) {
  try{
    const cuotasMensuales = await em.find(CuotaMensual, {}, {populate: ['socio', 'detalles'] }); 
    res.status(200).json({message: 'found all cuotas mensuales', data: cuotasMensuales});
  }catch (error:any) {
    res.status(500).send({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const cuotaMensual = await em.findOneOrFail(CuotaMensual, { id }, {populate: ['socio', 'detalles'] });
    res.status(200).json({message: 'found cuota mensual', data: cuotaMensual});
  } catch (error: any) {
    res.status(500).send({ message: error.message });
    
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
    console.error(error);
    return res.status(500).send({ message: error.message });  
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
    return res.status(500).send({ message: error.message });
    }
}

async function findBySocio(req: Request, res: Response) {
  try {
    const idSocio = Number.parseInt(req.params.id);
    const cuotas = await em.find(CuotaMensual, { socio: idSocio }, { populate: ['detalles'], orderBy: {anio: 'desc', mes: 'desc'} });
    res.status(200).json({ message: 'Cuotas del socio encontradas', data: cuotas });
  } catch (error: any) {
    console.error(' Error en findBySocio:', error);
    res.status(500).send({ message: error.message });
  }
}


export { sanitizeCuotaMensualInput, findAll, findOne, update, remove, findBySocio, generarCuotasDelMes, registrarPago, crearPreferenciaMP, aplicarPagoAprobado, confirmarPagoMP };