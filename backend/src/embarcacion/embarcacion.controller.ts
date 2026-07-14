import { Request, Response, NextFunction } from 'express';
import { Embarcacion } from './embarcacion.entity.js'; 
import { orm } from '../shared/orm.js'; 
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Amarra, Estado as EstadoAmarra } from '../amarra/amarra.entity.js';
import { Box, Estado as EstadoBox } from '../box/box.entity.js';

const em = orm.em;

function sanitizeEmbarcacionInput(req: Request, res: Response, next: NextFunction){
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
    const embarcaciones = await em.find(Embarcacion, {}, { populate: ['tipoEmbarcacion', 'socio'] }); 
    res.status(200).json({ message: 'found all embarcaciones', data: embarcaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacion = await em.findOneOrFail(Embarcacion, { id }, { populate: ['tipoEmbarcacion', 'socio', 'amarra', 'box'] });
    res.status(200).json({ message: 'found embarcacion', data: embarcacion });
  } catch (error: any) {
    res.status(404).json({ message: 'Embarcación no encontrada' });
  }
}

async function add(req: Request, res: Response) {
  try {
    // La amarra y el box se sacan ANTES de pasar por plainToInstance: si
    // class-transformer intenta asignar un id plano (número) a una propiedad
    // de relación de una entidad MikroORM, dispara el setter interno de la
    // relación 1:1 (pensado para recibir una entidad real) y explota con
    // "Cannot read properties of undefined (reading '__initialized')".
    const { amarra: amarraId, box: boxId, ...datosEmbarcacion } = req.body.sanitizedInput;

    // Validar solo los datos planos de la embarcación
    const embarcacionInstance = plainToInstance(Embarcacion, datosEmbarcacion);
    const errors = await validate(embarcacionInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const embarcacion = em.create(Embarcacion, datosEmbarcacion);

    if (amarraId !== undefined && amarraId !== null) {
      const amarraEntity = await em.findOneOrFail(Amarra, { id: amarraId });
      amarraEntity.estado = EstadoAmarra.OCUPADO;
      embarcacion.amarra = amarraEntity;
    }
    if (boxId !== undefined && boxId !== null) {
      const boxEntity = await em.findOneOrFail(Box, { id: boxId });
      boxEntity.estado = EstadoBox.OCUPADO;
      embarcacion.box = boxEntity;
    }

    await em.flush();
    res.status(201).json({ message: 'Embarcacion created', data: embarcacion });
  } catch (error: any) {
    console.error('❌ Error en add() de embarcacion:', error);
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'La amarra o el box seleccionado no existe.' });
    }
    if (error instanceof UniqueConstraintViolationException) {
      return res.status(409).json({
        message: 'La amarra o el box elegido ya tiene una embarcación asignada.'
      });
    }
    res.status(400).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacionToUpdate = await em.findOneOrFail(Embarcacion, { id }, { populate: ['amarra', 'box'] });

    // Igual que en add(): sacamos amarra/box ANTES de plainToInstance para
    // no disparar el setter de relación 1:1 con un id plano.
    const { amarra: amarraId, box: boxId, ...datosEmbarcacion } = req.body.sanitizedInput;

    // Validar solo los datos planos de la embarcación
    const embarcacionInstance = plainToInstance(Embarcacion, datosEmbarcacion);
    const errors = await validate(embarcacionInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(embarcacionToUpdate, datosEmbarcacion);

    if (amarraId !== undefined) {
      const amarraAnterior = embarcacionToUpdate.amarra;
      if (amarraId === null) {
        embarcacionToUpdate.amarra = null;
      } else {
        const nuevaAmarra = await em.findOneOrFail(Amarra, { id: amarraId });
        nuevaAmarra.estado = EstadoAmarra.OCUPADO;
        embarcacionToUpdate.amarra = nuevaAmarra;
      }
      // Si tenía asignada una amarra distinta, esa queda libre
      if (amarraAnterior && amarraAnterior.id !== amarraId) {
        amarraAnterior.estado = EstadoAmarra.LIBRE;
      }
    }
    if (boxId !== undefined) {
      const boxAnterior = embarcacionToUpdate.box;
      if (boxId === null) {
        embarcacionToUpdate.box = null;
      } else {
        const nuevoBox = await em.findOneOrFail(Box, { id: boxId });
        nuevoBox.estado = EstadoBox.OCUPADO;
        embarcacionToUpdate.box = nuevoBox;
      }
      // Si tenía asignado un box distinto, ese queda disponible
      if (boxAnterior && boxAnterior.id !== boxId) {
        boxAnterior.estado = EstadoBox.DISPONIBLE;
      }
    }

    await em.flush();
    res.status(200).json({ message: 'Embarcacion updated', data: embarcacionToUpdate });
  } catch (error: any) {
    console.error('❌ Error en update() de embarcacion:', error);
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: 'Embarcación, amarra o box no encontrado' });
    }
    if (error instanceof UniqueConstraintViolationException) {
      return res.status(409).json({
        message: 'La amarra o el box elegido ya tiene una embarcación asignada.'
      });
    }
    res.status(500).json({ message: error.message });  
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const embarcacion = await em.findOneOrFail(Embarcacion, { id }, { populate: ['amarra', 'box'] });

    if (embarcacion.amarra) {
      embarcacion.amarra.estado = EstadoAmarra.LIBRE;
    }
    if (embarcacion.box) {
      embarcacion.box.estado = EstadoBox.DISPONIBLE;
    }

    await em.removeAndFlush(embarcacion);
    res.status(200).json({ message: 'Embarcacion removed' });    
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
    const embarcaciones = await em.find(
      Embarcacion,
      { socio: idSocio },
      { populate: ['tipoEmbarcacion', 'socio'] }
    );

    res.status(200).json({ message: 'found embarcaciones by socio', data: embarcaciones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findEmbarcacionesClub(req: Request, res: Response) {
  try {
    const embarcaciones = await em.find(Embarcacion, { socio: null }, { populate: ['tipoEmbarcacion'] });
    res.status(200).json({ message: 'found embarcaciones without socio', data: embarcaciones });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}

export { sanitizeEmbarcacionInput, findAll, findOne, add, update, remove, findBySocio, findEmbarcacionesClub };