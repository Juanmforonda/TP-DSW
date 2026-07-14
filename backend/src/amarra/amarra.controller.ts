import { Request, Response, NextFunction } from 'express';
import { Amarra } from './amarra.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { orm } from '../shared/orm.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

const em = orm.em;
em.getRepository(Amarra);

function sanitizeAmarraInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    estado: req.body.estado,
    precioMensualBase: Number(req.body.precioMensualBase),
    longitudMax: Number(req.body.longitudMax),
    zona: req.body.zona,
    nroPilon: Number(req.body.nroPilon),
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
    const { zona, estado } = req.query;
    const where: any = {};
    
    if (zona) {
      where.zona = zona.toString();
    }
    if (estado) {
      where.estado = estado.toString();
    }
    
    const amarras = await em.find(Amarra, where, { populate: ['embarcacion', 'embarcacion.socio'] });
    res.status(200).json({
      message: Object.keys(where).length > 0 ? `Amarras filtradas por ${Object.keys(where).join(' y ')}` : 'Todas las amarras',
      data: amarras
    });
    
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al buscar amarras',
      error: error.message
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const amarra = await em.findOneOrFail(Amarra, { id }, { populate: ['embarcacion'] });
    res.status(200).json({ message: 'Amarra encontrada', data: amarra });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Amarra no encontrada' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function add(req: Request, res: Response) {
  try {
    // Validar datos antes de crear la amarra
    const amarraInstance = plainToInstance(Amarra, req.body);
    const errors = await validate(amarraInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const amarra = em.create(Amarra, req.body);
    await em.flush();
    res.status(201).json({ message: 'Amarra creada correctamente', data: amarra });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const amarraToUpdate = await em.findOneOrFail(Amarra, { id }, { populate: ['embarcacion'] });

    // 'embarcacion' se maneja aparte: no es un campo propio de Amarra, es la asignación 1:1.
    const { embarcacion: embarcacionId, ...datosAmarra } = req.body;

    // Validar solo los datos propios de la amarra
    const amarraInstance = plainToInstance(Amarra, datosAmarra);
    const errors = await validate(amarraInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(amarraToUpdate, datosAmarra);

    // Si vino 'embarcacion' en el body (aunque sea null), procesamos la asignación
    if (embarcacionId !== undefined) {
      if (embarcacionId === null) {
        // Desasignar: la embarcación que hoy tiene esta amarra queda libre
        if (amarraToUpdate.embarcacion) {
          amarraToUpdate.embarcacion.amarra = null;
        }
      } else {
        const embarcacionEntity = await em.findOneOrFail(Embarcacion, { id: Number(embarcacionId) });
        embarcacionEntity.amarra = amarraToUpdate;
      }
    }

    await em.flush();
    // Releemos para devolver el estado consistente con la embarcación ya asociada
    await em.populate(amarraToUpdate, ['embarcacion']);
    res.status(200).json({ message: 'Amarra actualizada correctamente', data: amarraToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Amarra o embarcación no encontrada' });
    } else if (error instanceof UniqueConstraintViolationException) {
      res.status(409).json({
        message: 'Esa embarcación ya tiene una amarra asignada. Desasignala primero antes de asociarla a otra amarra.'
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const amarraToRemove = await em.findOneOrFail(Amarra, { id });
    await em.removeAndFlush(amarraToRemove);
    res.status(200).json({ message: 'Amarra eliminada correctamente' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Amarra no encontrada' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

export { sanitizeAmarraInput, findAll, findOne, add, update, remove };