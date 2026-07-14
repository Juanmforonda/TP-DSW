import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { Box } from './box.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

function sanitizeBoxInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    estado: req.body.estado,
    nroBox: Number(req.body.nroBox),
    precioMensualBase: Number(req.body.precioMensualBase),
  };
  
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) { 
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

const em = orm.em;
em.getRepository(Box);

async function findAll(req: Request, res: Response) {
  try {
    const { estado } = req.query;
    const where: any = {};
    
    if (estado) {
      where.estado = estado.toString();
    }
    
    const boxes = await em.find(Box, where, { populate: ['embarcacion', 'embarcacion.socio'] });
    res.status(200).json({ 
      message: estado ? `Boxes filtrados por estado: ${estado}` : 'Todos los boxes',
      data: boxes 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error al buscar boxes',
      error: error.message
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const box = await em.findOneOrFail(Box, { id }, { populate: ['embarcacion'] });
    res.status(200).json({ message: 'Box encontrado', data: box });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Box no encontrado' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    
    // Validar datos antes de crear el box
    const boxInstance = plainToInstance(Box, req.body);
    const errors = await validate(boxInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const newBox = em.create(Box, req.body);
    await em.persistAndFlush(newBox);
    res.status(201).json({ message: 'Box creado correctamente', data: newBox });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error al crear box',
      error: error.message
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const boxToUpdate = await em.findOneOrFail(Box, { id }, { populate: ['embarcacion'] });

    // 'embarcacion' se maneja aparte: no es un campo propio de Box, es la asignación 1:1.
    const { embarcacion: embarcacionId } = req.body;

    // Sanitizar y validar datos propios del box
    const sanitizedInput = {
      estado: req.body.estado,
      nroBox: req.body.nroBox !== undefined ? String(req.body.nroBox) : undefined,
      precioMensualBase: req.body.precioMensualBase !== undefined ? Number(req.body.precioMensualBase) : undefined
    };
    Object.keys(sanitizedInput).forEach((key) => {
      if ((sanitizedInput as any)[key] === undefined) {
        delete (sanitizedInput as any)[key];
      }
    });

    const boxInstance = plainToInstance(Box, sanitizedInput);
    const errors = await validate(boxInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(boxToUpdate, sanitizedInput);

    // Si vino 'embarcacion' en el body (aunque sea null), procesamos la asignación
    if (embarcacionId !== undefined) {
      if (embarcacionId === null) {
        // Desasignar: la embarcación que hoy tiene este box queda libre
        if (boxToUpdate.embarcacion) {
          boxToUpdate.embarcacion.box = null;
        }
      } else {
        const embarcacionEntity = await em.findOneOrFail(Embarcacion, { id: Number(embarcacionId) });
        embarcacionEntity.box = boxToUpdate;
      }
    }

    await em.flush();
    await em.populate(boxToUpdate, ['embarcacion']);
    res.status(200).json({ message: 'Box actualizado correctamente', data: boxToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Box o embarcación no encontrada' });
    } else if (error instanceof UniqueConstraintViolationException) {
      res.status(409).json({
        message: 'Esa embarcación ya tiene un box asignado. Desasignala primero antes de asociarla a otro box.'
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const boxToRemove = await em.findOneOrFail(Box, { id });
    await em.removeAndFlush(boxToRemove);
    res.status(200).json({ message: 'Box eliminado correctamente' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Box no encontrado' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

export { sanitizeBoxInput, findAll, findOne, add, update, remove };