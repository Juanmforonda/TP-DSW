import { NextFunction, Request, Response } from 'express';
import { orm } from '../shared/orm.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { Socio } from '../socio/socio.entity.js';
import {
  EstadoReservaTravelLift,
  ReservaTravelLift,
} from './reservaTravelLift.entity.js';

const em = orm.em;
const HORA_EN_MILISEGUNDOS = 60 * 60 * 1000;

function sanitizeReservaTravelLiftInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fechaHoraInicio: req.body.fechaHoraInicio,
    fechaHoraFin: req.body.fechaHoraFin,
    estado: req.body.estado,
    socio: req.body.socio,
    embarcacion: req.body.embarcacion,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) delete req.body.sanitizedInput[key];
  });
  next();
}

function parseDate(value: unknown, label: string): Date {
  const date = new Date(String(value));
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`La ${label} es inválida`);
  }
  return date;
}

function validateTimeWindow(startValue: unknown, start: Date, end: Date) {
  const duration = end.getTime() - start.getTime();
  if (duration !== HORA_EN_MILISEGUNDOS) {
    throw new Error('La reserva del Travel Lift debe durar exactamente 1 hora');
  }

  // El frontend envía la hora local sin zona; para valores con zona se usa la
  // fecha interpretada por el servidor, manteniendo la validación en backend.
  const raw = String(startValue);
  const timeMatch = raw.match(/T(\d{2}):(\d{2})/);
  const hour = timeMatch ? Number(timeMatch[1]) : start.getHours();
  const minute = timeMatch ? Number(timeMatch[2]) : start.getMinutes();
  if (hour < 8 || hour > 17 || minute !== 0) {
    throw new Error('El Travel Lift solo puede reservarse entre las 08:00 y las 18:00');
  }
}

function validateStatus(value: unknown): EstadoReservaTravelLift {
  const status = (value ?? EstadoReservaTravelLift.ACTIVA) as EstadoReservaTravelLift;
  if (!Object.values(EstadoReservaTravelLift).includes(status)) {
    throw new Error('El estado debe ser ACTIVA, FINALIZADA o CANCELADA');
  }
  return status;
}

async function validateReservation(
  input: Record<string, any>,
  excludeId?: number
) {
  const start = parseDate(input.fechaHoraInicio, 'fecha y hora de inicio');
  const end = parseDate(input.fechaHoraFin, 'fecha y hora de fin');
  validateTimeWindow(input.fechaHoraInicio, start, end);

  const socio = await em.findOne(Socio, { id: Number(input.socio) });
  if (!socio) throw new Error('El socio indicado no existe');

  const embarcacion = await em.findOne(Embarcacion, { id: Number(input.embarcacion) });
  if (!embarcacion) throw new Error('La embarcación indicada no existe');
  if (!embarcacion.socio || embarcacion.socio.id !== socio.id) {
    throw new Error('La embarcación debe pertenecer al socio de la reserva');
  }

  const where: any = {
    estado: EstadoReservaTravelLift.ACTIVA,
    fechaHoraInicio: { $lt: end },
    fechaHoraFin: { $gt: start },
  };
  if (excludeId) where.id = { $ne: excludeId };
  const overlapping = await em.findOne(ReservaTravelLift, where);
  if (overlapping) {
    const conflictStart = overlapping.fechaHoraInicio.toLocaleString('es-AR');
    throw new Error(`El Travel Lift ya está reservado en ese horario (${conflictStart})`);
  }

  return { start, end, socio, embarcacion };
}

async function findAll(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.estado) filters.estado = req.query.estado;
    if (req.query.socio) filters.socio = Number(req.query.socio);
    if (req.query.embarcacion) filters.embarcacion = Number(req.query.embarcacion);
    const reservas = await em.find(ReservaTravelLift, filters, {
      populate: ['socio', 'embarcacion'],
      orderBy: { fechaHoraInicio: 'ASC' },
    });
    res.status(200).json({ message: 'found all reservasTravelLift', data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const reserva = await em.findOneOrFail(
      ReservaTravelLift,
      { id: Number.parseInt(req.params.id, 10) },
      { populate: ['socio', 'embarcacion'] }
    );
    res.status(200).json({ message: 'found reservaTravelLift', data: reserva });
  } catch (error: any) {
    res.status(error.name === 'NotFoundError' ? 404 : 500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput;
    const { start, end, socio, embarcacion } = await validateReservation(input);
    const reserva = em.create(ReservaTravelLift, {
      fechaHoraInicio: start,
      fechaHoraFin: end,
      estado: validateStatus(input.estado),
      socio,
      embarcacion,
    });
    await em.flush();
    res.status(201).json({ message: 'ReservaTravelLift created', data: reserva });
  } catch (error: any) {
    res.status(error.name === 'NotFoundError' ? 404 : 400).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const reserva = await em.findOneOrFail(ReservaTravelLift, { id });
    const input = { ...req.body.sanitizedInput };
    const merged = {
      fechaHoraInicio: input.fechaHoraInicio ?? reserva.fechaHoraInicio,
      fechaHoraFin: input.fechaHoraFin ?? reserva.fechaHoraFin,
      socio: input.socio ?? reserva.socio.id,
      embarcacion: input.embarcacion ?? reserva.embarcacion.id,
    };
    const { start, end, socio, embarcacion } = await validateReservation(merged, id);
    const nextStatus =
      input.estado !== undefined ? validateStatus(input.estado) : reserva.estado;
    em.assign(reserva, {
      fechaHoraInicio: start,
      fechaHoraFin: end,
      socio,
      embarcacion,
      estado: nextStatus,
    });
    await em.flush();
    res.status(200).json({ message: 'ReservaTravelLift updated', data: reserva });
  } catch (error: any) {
    res.status(error.name === 'NotFoundError' ? 404 : 400).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const reserva = await em.findOneOrFail(ReservaTravelLift, {
      id: Number.parseInt(req.params.id, 10),
    });
    await em.removeAndFlush(reserva);
    res.status(200).json({ message: 'ReservaTravelLift removed' });
  } catch (error: any) {
    res.status(error.name === 'NotFoundError' ? 404 : 500).json({ message: error.message });
  }
}

async function changeStatus(req: Request, res: Response, estado: EstadoReservaTravelLift) {
  try {
    const reserva = await em.findOneOrFail(ReservaTravelLift, {
      id: Number.parseInt(req.params.id, 10),
    });
    reserva.estado = estado;
    await em.flush();
    res.status(200).json({ message: `ReservaTravelLift ${estado.toLowerCase()}`, data: reserva });
  } catch (error: any) {
    res.status(error.name === 'NotFoundError' ? 404 : 500).json({ message: error.message });
  }
}

async function cancel(req: Request, res: Response) {
  return changeStatus(req, res, EstadoReservaTravelLift.CANCELADA);
}

async function finalizar(req: Request, res: Response) {
  return changeStatus(req, res, EstadoReservaTravelLift.FINALIZADA);
}

async function findBySocio(req: Request, res: Response) {
  try {
    const reservas = await em.find(
      ReservaTravelLift,
      { socio: Number.parseInt(req.params.idSocio, 10) },
      { populate: ['socio', 'embarcacion'], orderBy: { fechaHoraInicio: 'ASC' } }
    );
    res.status(200).json({ message: 'found reservasTravelLift for socio', data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeReservaTravelLiftInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  cancel,
  finalizar,
  findBySocio,
};
