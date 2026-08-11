import { Request, Response, NextFunction } from 'express';
import { Embarcacion } from './embarcacion.entity.js';
import { orm } from '../shared/orm.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Amarra, Estado as EstadoAmarra } from '../amarra/amarra.entity.js';
import { Box, Estado as EstadoBox } from '../box/box.entity.js';
import {
  EstadoReservaInfraestructura,
  ReservaInfraestructura,
} from '../reservaInfraestructura/reservaInfraestructura.entity.js';

const em = orm.em;

function sanitizeEmbarcacionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    matricula: req.body.matricula,
    eslora: req.body.eslora,
    tipoEmbarcacion: req.body.tipoEmbarcacion,
    socio: req.body.socio,
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

async function findAll(req: Request, res: Response) {
  try {
    const incluirInactivas = req.query.incluirInactivas === "true";
    const filtro = incluirInactivas ? {} : {fechaFin: null};

    const embarcaciones = await em.find(
      Embarcacion,
      filtro,
      { populate: ['tipoEmbarcacion', 'socio', 'reservasInfraestructura', 'reservasInfraestructura.amarra', 'reservasInfraestructura.box',] }
    );
    res.status(200).json({ message: 'found all embarcaciones', data: embarcaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacion = await em.findOneOrFail(
      Embarcacion,
      { id },
      {
        populate: [
          'tipoEmbarcacion',
          'socio',
          'reservasInfraestructura',
          'reservasInfraestructura.amarra',
          'reservasInfraestructura.box',
        ],
      }
    );
    res.status(200).json({ message: 'found embarcacion', data: embarcacion });
  } catch (error: any) {
    res.status(404).json({ message: 'Embarcación no encontrada' });
  }
}

function validarUbicacionExclusiva(amarraId: unknown, boxId: unknown) {
  const tieneAmarra = amarraId !== undefined && amarraId !== null;
  const tieneBox = boxId !== undefined && boxId !== null;
  if (!tieneAmarra && !tieneBox) {
    throw new Error('Debes asignar una amarra o un box para crear la embarcación');
  }
  if (tieneAmarra && tieneBox) {
    throw new Error('La embarcación no puede asignarse simultáneamente a amarra y box');
  }
}

async function add(req: Request, res: Response) {
  try {
    const { amarra: amarraId, box: boxId, ...datosEmbarcacion } = req.body.sanitizedInput;
    validarUbicacionExclusiva(amarraId, boxId);

    const embarcacionInstance = plainToInstance(Embarcacion, datosEmbarcacion);
    const errors = await validate(embarcacionInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const embarcacion = em.create(Embarcacion, datosEmbarcacion);

    const reserva = em.create(ReservaInfraestructura, {
      fechaInicio: new Date(),
      fechaFin: null,
      estado: EstadoReservaInfraestructura.ACTIVA,
      socio: embarcacion.socio ?? null,
      embarcacion,
      precioMensualFinal: 0,
    });

    if (amarraId !== undefined && amarraId !== null) {
      const amarraEntity = await em.findOneOrFail(Amarra, { id: Number(amarraId) });
      if (amarraEntity.estado === EstadoAmarra.MANTENIMIENTO) {
        return res.status(409).json({ message: 'La amarra seleccionada está en mantenimiento' });
      }

      const amarraOcupada = await em.findOne(ReservaInfraestructura, {
        amarra: amarraEntity.id,
        estado: EstadoReservaInfraestructura.ACTIVA,
      });
      if (amarraOcupada) {
        return res.status(409).json({ message: 'La amarra seleccionada ya tiene una reserva activa' });
      }

      reserva.amarra = amarraEntity;
      reserva.precioMensualFinal = Number(amarraEntity.precioMensualBase);
      amarraEntity.estado = EstadoAmarra.OCUPADO;
    }

    if (boxId !== undefined && boxId !== null) {
      const boxEntity = await em.findOneOrFail(Box, { id: Number(boxId) });
      if (boxEntity.estado === EstadoBox.MANTENIMIENTO) {
        return res.status(409).json({ message: 'El box seleccionado está en mantenimiento' });
      }

      const boxOcupado = await em.findOne(ReservaInfraestructura, {
        box: boxEntity.id,
        estado: EstadoReservaInfraestructura.ACTIVA,
      });
      if (boxOcupado) {
        return res.status(409).json({ message: 'El box seleccionado ya tiene una reserva activa' });
      }

      reserva.box = boxEntity;
      reserva.precioMensualFinal = Number(boxEntity.precioMensualBase);
      boxEntity.estado = EstadoBox.OCUPADO;
    }

    await em.flush();
    res.status(201).json({ message: 'Embarcacion created', data: embarcacion });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'La amarra o el box seleccionado no existe.' });
    }
    if (error instanceof UniqueConstraintViolationException) {
      return res.status(409).json({
        message: 'No se pudo crear la embarcación por conflicto de unicidad',
      });
    }
    res.status(400).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacionToUpdate = await em.findOneOrFail(Embarcacion, { id });
    const { amarra, box, ...datosEmbarcacion } = req.body.sanitizedInput;

    if (amarra !== undefined || box !== undefined) {
      return res.status(400).json({
        message:
          'La ubicación ya no se actualiza desde embarcaciones. Usa reservas de infraestructura.',
      });
    }

    const embarcacionInstance = plainToInstance(Embarcacion, datosEmbarcacion);
    const errors = await validate(embarcacionInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(embarcacionToUpdate, datosEmbarcacion);
    await em.flush();
    res.status(200).json({ message: 'Embarcacion updated', data: embarcacionToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Embarcación no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacion = await em.findOneOrFail(
      Embarcacion,
      { id },
      { populate: ['reservasInfraestructura', 'reservasInfraestructura.amarra', 'reservasInfraestructura.box'] }
    );

    if(embarcacion.fechaFin){
      return res.status(409).json({message: "La embarcacion ya se dio de baja"})
    }

    for (const reserva of embarcacion.reservasInfraestructura) {
      if (reserva.estado === EstadoReservaInfraestructura.ACTIVA) {
        reserva.estado = EstadoReservaInfraestructura.CANCELADA;
        reserva.fechaFin = reserva.fechaFin ?? new Date();
        if (reserva.amarra && reserva.amarra.estado !== EstadoAmarra.MANTENIMIENTO) {
          reserva.amarra.estado = EstadoAmarra.LIBRE;
        }
        if (reserva.box && reserva.box.estado !== EstadoBox.MANTENIMIENTO) {
          reserva.box.estado = EstadoBox.DISPONIBLE;
        }
      }
    }

    embarcacion.fechaFin = new Date();

    await em.flush();
    res.status(200).json({ message: 'Embarcacion dada de baja' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Embarcación no encontrada' });
    }
    res.status(500).json({ message: error.message });
  }
}

async function findBySocio(req: Request, res: Response) {
  try {
    const idSocio = Number.parseInt(req.params.idSocio);
    const incluirInactivas = req.query.incluirInactivas === 'true';
    const filtro = incluirInactivas
      ? { socio: idSocio }
      : { socio: idSocio, fechaFin: null };
    const embarcaciones = await em.find(
      Embarcacion,
      filtro,
      { populate: ['tipoEmbarcacion', 'socio'] }
    );

    res.status(200).json({ message: 'found embarcaciones by socio', data: embarcaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findEmbarcacionesClub(req: Request, res: Response) {
  try {
    const embarcaciones = await em.find(Embarcacion, { socio: null, fechaFin: null }, { populate: ['tipoEmbarcacion'] });
    res.status(200).json({ message: 'found embarcaciones without socio', data: embarcaciones });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}


async function cambiarUbicacion(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const { amarra: nuevaAmarraId, box: nuevoBoxId } = req.body;

    validarUbicacionExclusiva(nuevaAmarraId, nuevoBoxId);

    await em.transactional(async (em) => {
      const embarcacion = await em.findOneOrFail(
        Embarcacion,
        { id },
        { populate: ['reservasInfraestructura', 'reservasInfraestructura.amarra', 'reservasInfraestructura.box'] }
      );

      if (embarcacion.fechaFin) {
        throw new Error('No se puede cambiar la ubicación de una embarcación dada de baja');
      }

      // 1. Cerrar la reserva activa actual (si existe)
      const reservaActual = embarcacion.reservasInfraestructura
        .getItems()
        .find((r) => r.estado === EstadoReservaInfraestructura.ACTIVA);

      if (reservaActual) {
        reservaActual.estado = EstadoReservaInfraestructura.CANCELADA;
        reservaActual.fechaFin = new Date();

        if (reservaActual.amarra && reservaActual.amarra.estado !== EstadoAmarra.MANTENIMIENTO) {
          reservaActual.amarra.estado = EstadoAmarra.LIBRE;
        }
        if (reservaActual.box && reservaActual.box.estado !== EstadoBox.MANTENIMIENTO) {
          reservaActual.box.estado = EstadoBox.DISPONIBLE;
        }
      }

      // 2. Crear la nueva reserva
      const nuevaReserva = em.create(ReservaInfraestructura, {
        fechaInicio: new Date(),
        fechaFin: null,
        estado: EstadoReservaInfraestructura.ACTIVA,
        socio: embarcacion.socio ?? null,
        embarcacion,
        precioMensualFinal: 0,
      });

      if (nuevaAmarraId !== undefined && nuevaAmarraId !== null) {
        const amarraEntity = await em.findOneOrFail(Amarra, { id: Number(nuevaAmarraId) });

        if (amarraEntity.estado === EstadoAmarra.MANTENIMIENTO) {
          throw new Error('La amarra seleccionada está en mantenimiento');
        }

        const amarraOcupada = await em.findOne(ReservaInfraestructura, {
          amarra: amarraEntity.id,
          estado: EstadoReservaInfraestructura.ACTIVA,
        });
        if (amarraOcupada) {
          throw new Error('La amarra seleccionada ya tiene una reserva activa');
        }

        nuevaReserva.amarra = amarraEntity;
        nuevaReserva.precioMensualFinal = Number(amarraEntity.precioMensualBase);
        amarraEntity.estado = EstadoAmarra.OCUPADO;
      }

      if (nuevoBoxId !== undefined && nuevoBoxId !== null) {
        const boxEntity = await em.findOneOrFail(Box, { id: Number(nuevoBoxId) });

        if (boxEntity.estado === EstadoBox.MANTENIMIENTO) {
          throw new Error('El box seleccionado está en mantenimiento');
        }

        const boxOcupado = await em.findOne(ReservaInfraestructura, {
          box: boxEntity.id,
          estado: EstadoReservaInfraestructura.ACTIVA,
        });
        if (boxOcupado) {
          throw new Error('El box seleccionado ya tiene una reserva activa');
        }

        nuevaReserva.box = boxEntity;
        nuevaReserva.precioMensualFinal = Number(boxEntity.precioMensualBase);
        boxEntity.estado = EstadoBox.OCUPADO;
      }

      em.persist(nuevaReserva);
    });

    const embarcacionActualizada = await em.findOneOrFail(
      Embarcacion,
      { id },
      { populate: ['reservasInfraestructura', 'reservasInfraestructura.amarra', 'reservasInfraestructura.box'] }
    );

    res.status(200).json({ message: 'Ubicación cambiada correctamente', data: embarcacionActualizada });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'La embarcación, amarra o box no existe' });
    }
    res.status(409).json({ message: error.message });
  }
}

export {
  sanitizeEmbarcacionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  findBySocio,
  findEmbarcacionesClub,
  cambiarUbicacion,
};

