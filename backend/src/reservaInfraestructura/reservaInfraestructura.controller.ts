import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import {
  EstadoReservaInfraestructura,
  ReservaInfraestructura,
} from './reservaInfraestructura.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { Amarra, Estado as EstadoAmarra } from '../amarra/amarra.entity.js';
import { Box, Estado as EstadoBox } from '../box/box.entity.js';

const em = orm.em;

function sanitizeReservaInfraestructuraInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fechaInicio: req.body.fechaInicio,
    fechaFin: req.body.fechaFin,
    estado: req.body.estado,
    precioMensualFinal: req.body.precioMensualFinal,
    socio: req.body.socio,
    embarcacion: req.body.embarcacion,
    amarra: req.body.amarra,
    box: req.body.box,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

function validarXorUbicacion(amarraId: unknown, boxId: unknown) {
  const tieneAmarra = amarraId !== null && amarraId !== undefined;
  const tieneBox = boxId !== null && boxId !== undefined;

  if (tieneAmarra === tieneBox) {
    throw new Error('La reserva debe tener exactamente una ubicación: amarra o box');
  }
}

function validarFechas(inicio: Date, fin?: Date | null) {
  if (Number.isNaN(inicio.getTime())) {
    throw new Error('La fecha de inicio es inválida');
  }
  if (fin && Number.isNaN(fin.getTime())) {
    throw new Error('La fecha de fin es inválida');
  }
  if (fin && inicio > fin) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin');
  }
}

async function marcarInfraestructuraLibreSiCorresponde(reserva: ReservaInfraestructura) {
  if (reserva.amarra) {
    const otraActiva = await em.findOne(ReservaInfraestructura, {
      amarra: reserva.amarra.id,
      estado: EstadoReservaInfraestructura.ACTIVA,
      id: { $ne: reserva.id },
    });
    if (!otraActiva && reserva.amarra.estado !== EstadoAmarra.MANTENIMIENTO) {
      reserva.amarra.estado = EstadoAmarra.LIBRE;
    }
  }

  if (reserva.box) {
    const otraActiva = await em.findOne(ReservaInfraestructura, {
      box: reserva.box.id,
      estado: EstadoReservaInfraestructura.ACTIVA,
      id: { $ne: reserva.id },
    });
    if (!otraActiva && reserva.box.estado !== EstadoBox.MANTENIMIENTO) {
      reserva.box.estado = EstadoBox.DISPONIBLE;
    }
  }
}

async function validarDisponibilidadInfraestructura(
  amarraId: number | null,
  boxId: number | null,
  excluirReservaId?: number
) {
  if (amarraId !== null) {
    const amarra = await em.findOneOrFail(Amarra, { id: amarraId });
    if (amarra.estado === EstadoAmarra.MANTENIMIENTO) {
      throw new Error('La amarra seleccionada está en mantenimiento');
    }

    const activaEnAmarra = await em.findOne(ReservaInfraestructura, {
      amarra: amarraId,
      estado: EstadoReservaInfraestructura.ACTIVA,
      ...(excluirReservaId ? { id: { $ne: excluirReservaId } } : {}),
    });
    if (activaEnAmarra) {
      throw new Error('La amarra seleccionada ya tiene una reserva activa');
    }
  }

  if (boxId !== null) {
    const box = await em.findOneOrFail(Box, { id: boxId });
    if (box.estado === EstadoBox.MANTENIMIENTO) {
      throw new Error('El box seleccionado está en mantenimiento');
    }

    const activaEnBox = await em.findOne(ReservaInfraestructura, {
      box: boxId,
      estado: EstadoReservaInfraestructura.ACTIVA,
      ...(excluirReservaId ? { id: { $ne: excluirReservaId } } : {}),
    });
    if (activaEnBox) {
      throw new Error('El box seleccionado ya tiene una reserva activa');
    }
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const reservas = await em.find(
      ReservaInfraestructura,
      {},
      { populate: ['socio', 'embarcacion', 'amarra', 'box'] }
    );
    res.status(200).json({ message: 'found all reservasInfraestructura', data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reserva = await em.findOneOrFail(
      ReservaInfraestructura,
      { id },
      { populate: ['socio', 'embarcacion', 'amarra', 'box'] }
    );
    res.status(200).json({ message: 'found reservaInfraestructura', data: reserva });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Reserva de infraestructura no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput;
    validarXorUbicacion(input.amarra, input.box);

    const fechaInicio = input.fechaInicio ? new Date(input.fechaInicio) : new Date();
    const fechaFin = input.fechaFin ? new Date(input.fechaFin) : null;
    validarFechas(fechaInicio, fechaFin);

    const embarcacion = await em.findOneOrFail(Embarcacion, { id: Number(input.embarcacion) }, { populate: ['socio'] });
    const socioDeReserva =
      input.socio !== undefined ? input.socio : embarcacion.socio ? embarcacion.socio.id : null;

    if (embarcacion.socio && socioDeReserva !== embarcacion.socio.id) {
      return res.status(400).json({
        message: 'El socio de la reserva debe coincidir con el socio de la embarcación',
      });
    }
    if (!embarcacion.socio && socioDeReserva !== null) {
      return res.status(400).json({
        message: 'Una embarcación del club debe reservarse con socio null',
      });
    }

    const estado = input.estado ?? EstadoReservaInfraestructura.ACTIVA;
    const amarraId = input.amarra !== undefined && input.amarra !== null ? Number(input.amarra) : null;
    const boxId = input.box !== undefined && input.box !== null ? Number(input.box) : null;

    if (estado === EstadoReservaInfraestructura.ACTIVA) {
      await validarDisponibilidadInfraestructura(amarraId, boxId);
      const activaDeEmbarcacion = await em.findOne(ReservaInfraestructura, {
        embarcacion: embarcacion.id,
        estado: EstadoReservaInfraestructura.ACTIVA,
      });
      if (activaDeEmbarcacion) {
        return res.status(409).json({
          message: 'La embarcación ya tiene una reserva de infraestructura activa',
        });
      }
    }

    const reserva = em.create(ReservaInfraestructura, {
      fechaInicio,
      fechaFin,
      estado,
      embarcacion,
      socio: socioDeReserva,
      precioMensualFinal: 0,
    });

    if (amarraId !== null) {
      const amarra = await em.findOneOrFail(Amarra, { id: amarraId });
      reserva.amarra = amarra;
      reserva.precioMensualFinal = Number(amarra.precioMensualBase);
      if (estado === EstadoReservaInfraestructura.ACTIVA) {
        amarra.estado = EstadoAmarra.OCUPADO;
      }
    } else {
      const box = await em.findOneOrFail(Box, { id: boxId as number });
      reserva.box = box;
      reserva.precioMensualFinal = Number(box.precioMensualBase);
      if (estado === EstadoReservaInfraestructura.ACTIVA) {
        box.estado = EstadoBox.OCUPADO;
      }
    }

    await em.flush();
    res.status(201).json({ message: 'ReservaInfraestructura created', data: reserva });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'No existe la embarcación o infraestructura indicada' });
    }
    res.status(400).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reserva = await em.findOneOrFail(
      ReservaInfraestructura,
      { id },
      { populate: ['embarcacion', 'embarcacion.socio', 'amarra', 'box'] }
    );

    const input = req.body.sanitizedInput;
    const estadoObjetivo = input.estado ?? reserva.estado;
    const fechaInicio = input.fechaInicio ? new Date(input.fechaInicio) : reserva.fechaInicio;
    const fechaFin =
      input.fechaFin !== undefined ? (input.fechaFin ? new Date(input.fechaFin) : null) : (reserva.fechaFin ?? null);
    validarFechas(fechaInicio, fechaFin);

    const amarraId: number | null =
      input.amarra !== undefined
        ? input.amarra === null
          ? null
          : Number(input.amarra)
        : reserva.amarra
          ? (reserva.amarra.id ?? null)
          : null;
    const boxId: number | null =
      input.box !== undefined
        ? input.box === null
          ? null
          : Number(input.box)
        : reserva.box
          ? (reserva.box.id ?? null)
          : null;

    if (reserva.id === undefined) {
      return res.status(500).json({ message: 'La reserva no tiene un id válido' });
    }

    validarXorUbicacion(amarraId, boxId);

    if (estadoObjetivo === EstadoReservaInfraestructura.ACTIVA) {
      await validarDisponibilidadInfraestructura(amarraId, boxId, reserva.id);
      const activaDeEmbarcacion = await em.findOne(ReservaInfraestructura, {
        embarcacion: reserva.embarcacion.id,
        estado: EstadoReservaInfraestructura.ACTIVA,
        id: { $ne: reserva.id },
      });
      if (activaDeEmbarcacion) {
        return res.status(409).json({
          message: 'La embarcación ya tiene otra reserva de infraestructura activa',
        });
      }
    }

    if (input.socio !== undefined) {
      if (reserva.embarcacion.socio && input.socio !== reserva.embarcacion.socio.id) {
        return res.status(400).json({
          message: 'El socio de la reserva debe coincidir con el socio de la embarcación',
        });
      }
      if (!reserva.embarcacion.socio && input.socio !== null) {
        return res.status(400).json({
          message: 'Una embarcación del club debe reservarse con socio null',
        });
      }
      reserva.socio = input.socio;
    }

    const amarraOriginal = reserva.amarra;
    const boxOriginal = reserva.box;

    reserva.fechaInicio = fechaInicio;
    reserva.fechaFin = fechaFin;
    reserva.estado = estadoObjetivo;

    if (amarraId !== null) {
      const amarra = await em.findOneOrFail(Amarra, { id: amarraId });
      reserva.amarra = amarra;
      reserva.box = null;
      reserva.precioMensualFinal = Number(amarra.precioMensualBase);
      if (estadoObjetivo === EstadoReservaInfraestructura.ACTIVA) {
        amarra.estado = EstadoAmarra.OCUPADO;
      }
    } else {
      const box = await em.findOneOrFail(Box, { id: boxId as number });
      reserva.box = box;
      reserva.amarra = null;
      reserva.precioMensualFinal = Number(box.precioMensualBase);
      if (estadoObjetivo === EstadoReservaInfraestructura.ACTIVA) {
        box.estado = EstadoBox.OCUPADO;
      }
    }

    if (amarraOriginal && (!reserva.amarra || reserva.amarra.id !== amarraOriginal.id)) {
      const pseudo = em.create(ReservaInfraestructura, {
        id: reserva.id,
        amarra: amarraOriginal,
        box: null,
      } as any);
      await marcarInfraestructuraLibreSiCorresponde(pseudo);
    }

    if (boxOriginal && (!reserva.box || reserva.box.id !== boxOriginal.id)) {
      const pseudo = em.create(ReservaInfraestructura, {
        id: reserva.id,
        amarra: null,
        box: boxOriginal,
      } as any);
      await marcarInfraestructuraLibreSiCorresponde(pseudo);
    }

    if (estadoObjetivo !== EstadoReservaInfraestructura.ACTIVA) {
      await marcarInfraestructuraLibreSiCorresponde(reserva);
    }

    await em.flush();
    res.status(200).json({ message: 'ReservaInfraestructura updated', data: reserva });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Reserva o infraestructura no encontrada' });
    }
    res.status(400).json({ message: error.message });
  }
}

async function finalizar(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reserva = await em.findOneOrFail(ReservaInfraestructura, { id }, { populate: ['amarra', 'box'] });
    reserva.estado = EstadoReservaInfraestructura.FINALIZADA;
    if (!reserva.fechaFin) {
      reserva.fechaFin = new Date();
    }
    await marcarInfraestructuraLibreSiCorresponde(reserva);
    await em.flush();
    res.status(200).json({ message: 'ReservaInfraestructura finalized', data: reserva });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Reserva de infraestructura no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function cancel(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reserva = await em.findOneOrFail(ReservaInfraestructura, { id }, { populate: ['amarra', 'box'] });
    reserva.estado = EstadoReservaInfraestructura.CANCELADA;
    if (!reserva.fechaFin) {
      reserva.fechaFin = new Date();
    }
    await marcarInfraestructuraLibreSiCorresponde(reserva);
    await em.flush();
    res.status(200).json({ message: 'ReservaInfraestructura cancelled', data: reserva });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Reserva de infraestructura no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reserva = await em.findOneOrFail(ReservaInfraestructura, { id }, { populate: ['amarra', 'box'] });
    const estabaActiva = reserva.estado === EstadoReservaInfraestructura.ACTIVA;
    reserva.estado = EstadoReservaInfraestructura.CANCELADA;
    if (!reserva.fechaFin) {
      reserva.fechaFin = new Date();
    }
    if (estabaActiva) {
      await marcarInfraestructuraLibreSiCorresponde(reserva);
    }
    await em.removeAndFlush(reserva);
    res.status(200).json({ message: 'ReservaInfraestructura removed' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Reserva de infraestructura no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function findByEmbarcacion(req: Request, res: Response) {
  try {
    const idEmbarcacion = Number.parseInt(req.params.idEmbarcacion);
    const reservas = await em.find(
      ReservaInfraestructura,
      { embarcacion: idEmbarcacion },
      { populate: ['socio', 'embarcacion', 'amarra', 'box'] }
    );
    res.status(200).json({ message: 'found reservas by embarcacion', data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeReservaInfraestructuraInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  cancel,
  finalizar,
  findByEmbarcacion,
};
