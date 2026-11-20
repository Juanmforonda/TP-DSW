import { ReservaEmbarcacionClub } from './reservaEmbarcacionClub.entity.js';
import { orm } from '../shared/orm.js';
import { NextFunction, Request, Response } from 'express';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';

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
    throw { status: 400, message: 'La reserva no puede ser mayor a 3 horas' };
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
    throw {
      status: 409,
      message: 'La embarcación ya tiene una reserva activa en ese horario',
    };
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
    res.status(500).send({ message: error.message });
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
    res.status(500).send({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  const user = (req as AuthenticatedRequest).user;
  if (user.tipo === 'socio') {
    req.body.sanitizedInput.socio = user.id;
  }

  const embarcacionExists = await em.findOne(Embarcacion, {
    id: req.body.sanitizedInput.embarcacion,
  });

  if (!embarcacionExists || embarcacionExists.socio !== null) {
    return res
      .status(400)
      .send({
        message:
          'Embarcación no encontrada o no corresponde a una embarcacion del club',
      });
  }

  

  try {
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
    return res.status(400).send({ message: error.message });
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
    if (user.tipo === 'socio') {
      req.body.sanitizedInput.socio = user.id;
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
    res.status(500).send({ message: error.message });
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
    res.status(500).send({ message: error.message });
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
    reservaEmbarcacionClub.estado = 'CANCELADA';
    await em.flush();
    res.status(200).json({message: 'ReservaEmbarcacionClub cancelled', data: reservaEmbarcacionClub});
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}

async function finalizar (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const reservaEmbarcacionClub = await em.findOneOrFail(ReservaEmbarcacionClub, {id});
    reservaEmbarcacionClub.estado = 'FINALIZADA';
    await em.flush();
    res.status(200).json({message: 'ReservaEmbarcacionClub finalized', data: reservaEmbarcacionClub});
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}

async function getReservasPorSocio(req: Request, res: Response) {
  const idSocio = Number.parseInt(req.params.idSocio);
  try {
    const reservas = await em.find(ReservaEmbarcacionClub, {socio : idSocio}, {populate: ['embarcacion', 'socio']});
    res.status(200).json({message: 'found reservas for socio', data: reservas});
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}

async function getReservasPorEmbarcacion(req: Request, res: Response) {
  const idEmbarcacion = Number.parseInt(req.params.idEmbarcacion);
  try {
    const reservas = await em.find(ReservaEmbarcacionClub, {embarcacion : idEmbarcacion}, {populate: ['embarcacion', 'socio']});
    res.status(200).json({message: 'found reservas for embarcacion', data: reservas});
  } catch (error: any) {
    res.status(500).send({ message: error.message });
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
  cancel,
  finalizar
};
