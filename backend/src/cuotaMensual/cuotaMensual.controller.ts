import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { CuotaMensual, MetodoPago } from './cuotaMensual.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { ReservaInfraestructura, EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { CUOTA_BASE_CLUB } from '../config/cuotas.config.js';
const em = orm.em;

function sanitizeCuotaMensualInput(req: Request, res: Response, next: NextFunction) {
  const body = req.body || {};
  const input: any = {};

  if (body.fechaVencimiento) {
    input.fechaVencimiento = new Date(body.fechaVencimiento); // validar en handler si hace falta
  }


  if (body.socio !== undefined && body.socio !== null && body.socio !== '') {
    input.socio = Number(body.socio); // dejo solo el id numérico aquí
  }

  req.body.sanitizedInput = input;
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


export { sanitizeCuotaMensualInput, findAll, findOne, update, remove, findBySocio, generarCuotasDelMes };