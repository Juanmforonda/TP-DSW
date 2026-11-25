import { ReservaEmbarcacionClub } from './reservaEmbarcacionClub.entity.js';
import { orm } from '../shared/orm.js';
import { NextFunction, Request, Response } from 'express';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { HttpError, sendHttpError } from '../shared/http-errors.js';

const em = orm.em;
function sanitizeReservaEmbarcacionClubInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fechaInicio: req.body.fechaInicio,
    fechaFin: req.body.fechaFin,
    estado: req.body.estado,
    embarcacion: req.body.embarcacion,
    socio: req.body.socio,
  };
  //mas validaciones si es necesario

  if (req.body.sanitizedInput.fechaInicio > req.body.sanitizedInput.fechaFin) {
    return res
      .status(400)
      .send({
        message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      });
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function validarDuracionYSolapamiento(em: any,inicio: Date, fin: Date,embarcacionId: number, excludeId?: number) {

  if (fin.getTime() - inicio.getTime() > 3 * 60 * 60 * 1000) {
    throw new HttpError(400, 'La reserva no puede ser mayor a 3 horas');
  }

  const where: any = {
    embarcacion: embarcacionId,
    estado: 'ACTIVA',
    fechaInicio: { $lt: fin },
    fechaFin: { $gt: inicio },
  };
  if (excludeId) where.id = { $ne: excludeId }; //sintaxis para "no igual"

  const solapada = await em.findOne(ReservaEmbarcacionClub, where);
  if (solapada) {
    throw new HttpError(409, 'La embarcación ya tiene una reserva activa en ese horario');
  }
}

async function findAll(req: Request, res: Response) {
  const { embarcacionId, fechaInicio, estado, socio } = req.query;

  const filters: any = {};

  if (embarcacionId) {
    filters.embarcacion = { id: Number(embarcacionId) };
  }
  if (fechaInicio) {
    filters.fechaInicio = new Date(fechaInicio as string);
  }
  if (estado) {
    filters.estado = estado;
  }
  if (socio) {
    filters.socio = { id: Number(socio) };
  }

  try {
    const reservasEmbarcacionClub = await em.find(
      ReservaEmbarcacionClub,
      filters,
      { populate: ['embarcacion'] }
    );
    res
      .status(200)
      .json({
        message: 'found all reservasEmbarcacionClub',
        data: reservasEmbarcacionClub,
      });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reservaEmbarcacionClub = await em.findOneOrFail(
      ReservaEmbarcacionClub,
      { id },
      { populate: ['embarcacion'] }
    );
    res
      .status(200)
      .json({
        message: 'found reservaEmbarcacionClub',
        data: reservaEmbarcacionClub,
      });
  } catch (error: any) {
    sendHttpError(error, req, res, 'Reserva de embarcación del club no encontrada');
  }
}

async function add(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (user.tipo === 'socio') {
      req.body.sanitizedInput.socio = user.id;
      req.body.sanitizedInput.estado = 'ACTIVA';
    }

    const embarcacionExists = await em.findOne(Embarcacion, {
      id: req.body.sanitizedInput.embarcacion,
    });

    if (!embarcacionExists || embarcacionExists.socio !== null) {
      return res.status(400).send({
        message:
          'Embarcación no encontrada o no corresponde a una embarcacion del club',
      });
    }

    await validarDuracionYSolapamiento(
      em,
      new Date(req.body.sanitizedInput.fechaInicio),
      new Date(req.body.sanitizedInput.fechaFin),
      req.body.sanitizedInput.embarcacion
    );
    const reservaEmbarcacionClub = em.create(
      ReservaEmbarcacionClub,
      req.body.sanitizedInput
    );
    await em.flush();
    res
      .status(201)
      .json({
        message: 'ReservaEmbarcacionClub created',
        data: reservaEmbarcacionClub,
      });
  } catch (error: any) {
    return sendHttpError(error, req, res);
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = (req as AuthenticatedRequest).user;
    const reservaEmbarcacionClub = await em.findOneOrFail(
      ReservaEmbarcacionClub,
      { id },
      { populate: ['socio'] }
    );
    if (
      user.tipo === 'socio' &&
      String(reservaEmbarcacionClub.socio?.id) !== String(user.id)
    ) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    if (user.tipo === 'socio' && reservaEmbarcacionClub.estado !== 'ACTIVA') {
      return res.status(409).json({ message: 'Solo se pueden editar reservas activas' });
    }
    if (user.tipo === 'socio') {
      req.body.sanitizedInput.socio = user.id;
      if (req.body.sanitizedInput.estado !== undefined) {
        return res.status(403).json({ message: 'No tenés permiso para cambiar el estado de la reserva' });
      }
    }
    const estadosValidos = ['ACTIVA', 'CANCELADA', 'FINALIZADA'];
    if (
      req.body.sanitizedInput.estado !== undefined &&
      !estadosValidos.includes(req.body.sanitizedInput.estado)
    ) {
      return res.status(400).json({ message: 'Estado de reserva inválido' });
    }

    if (req.body.sanitizedInput.embarcacion) {
      const embarcacionExists = await em.findOne(Embarcacion, {
        id: req.body.sanitizedInput.embarcacion,
      });
      if (!embarcacionExists) {
        return res.status(400).send({ message: 'Embarcación no encontrada' });
      }
    }

    if (req.body.sanitizedInput.fechaInicio && req.body.sanitizedInput.fechaFin) {
      await validarDuracionYSolapamiento(
        em,
        new Date(req.body.sanitizedInput.fechaInicio),
        new Date(req.body.sanitizedInput.fechaFin),
        req.body.sanitizedInput.embarcacion,
        reservaEmbarcacionClub.id
      );
    }

    em.assign(reservaEmbarcacionClub, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'ReservaEmbarcacionClub updated',
        data: reservaEmbarcacionClub,
      });
  } catch (error: any) {
    sendHttpError(error, req, res, 'Reserva de embarcación del club no encontrada');
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reservaEmbarcacionClub = await em.findOneOrFail(
      ReservaEmbarcacionClub,
      { id }
    );
    await em.removeAndFlush(reservaEmbarcacionClub);
    res.status(200).json({ message: 'ReservaEmbarcacionClub removed' });
  } catch (error: any) {
    sendHttpError(error, req, res, 'Reserva de embarcación del club no encontrada');
  }
}

async function cancel (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = (req as AuthenticatedRequest).user;
    const reservaEmbarcacionClub = await em.findOneOrFail(
      ReservaEmbarcacionClub,
      { id },
      { populate: ['socio'] }
    );
    if (
      user.tipo === 'socio' &&
      String(reservaEmbarcacionClub.socio?.id) !== String(user.id)
    ) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    if (reservaEmbarcacionClub.estado !== 'ACTIVA') {
      return res.status(409).json({ message: 'Solo se pueden cancelar reservas activas' });
    }
    reservaEmbarcacionClub.estado = 'CANCELADA';
    await em.flush();
    res.status(200).json({message: 'ReservaEmbarcacionClub cancelled', data: reservaEmbarcacionClub});
  } catch (error: any) {
    sendHttpError(error, req, res, 'Reserva de embarcación del club no encontrada');
  }
}

async function finalizar (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = (req as AuthenticatedRequest).user;
    const reservaEmbarcacionClub = await em.findOneOrFail(
      ReservaEmbarcacionClub,
      { id },
      { populate: ['socio'] }
    );
    if (
      user.tipo === 'socio' &&
      String(reservaEmbarcacionClub.socio?.id) !== String(user.id)
    ) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    if (reservaEmbarcacionClub.estado !== 'ACTIVA') {
      return res.status(409).json({ message: 'Solo se pueden finalizar reservas activas' });
    }
    reservaEmbarcacionClub.estado = 'FINALIZADA';
    await em.flush();
    res.status(200).json({message: 'ReservaEmbarcacionClub finalized', data: reservaEmbarcacionClub});
  } catch (error: any) {
    sendHttpError(error, req, res, 'Reserva de embarcación del club no encontrada');
  }
}

async function getReservasPorSocio(req: Request, res: Response) {
  const idSocio = Number.parseInt(req.params.idSocio);
  try {
    const reservas = await em.find(ReservaEmbarcacionClub, {socio : idSocio}, {populate: ['embarcacion', 'socio']});
    res.status(200).json({message: 'found reservas for socio', data: reservas});
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function getReservasPorEmbarcacion(req: Request, res: Response) {
  const idEmbarcacion = Number.parseInt(req.params.idEmbarcacion);
  try {
    const reservas = await em.find(ReservaEmbarcacionClub, {embarcacion : idEmbarcacion}, {populate: ['embarcacion', 'socio']});
    res.status(200).json({message: 'found reservas for embarcacion', data: reservas});
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function getDisponibilidadPorEmbarcacion(req: Request, res: Response) {
  try {
    const idEmbarcacion = Number.parseInt(req.params.idEmbarcacion, 10);
    if (!Number.isInteger(idEmbarcacion) || idEmbarcacion <= 0) {
      return res.status(400).json({ message: 'El identificador de embarcación no es válido' });
    }

    const reservas = await em.find(
      ReservaEmbarcacionClub,
      { embarcacion: idEmbarcacion, estado: 'ACTIVA' },
      { orderBy: { fechaInicio: 'ASC' } }
    );
    return res.status(200).json({
      message: 'Disponibilidad de la embarcación encontrada',
      data: reservas.map(({ id, fechaInicio, fechaFin, estado }) => ({
        id,
        fechaInicio,
        fechaFin,
        estado,
      })),
    });
  } catch (error: any) {
    return sendHttpError(error, req, res);
  }
}

export {
  sanitizeReservaEmbarcacionClubInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  getReservasPorSocio,
  getReservasPorEmbarcacion,
  getDisponibilidadPorEmbarcacion,
  cancel,
  finalizar
};
