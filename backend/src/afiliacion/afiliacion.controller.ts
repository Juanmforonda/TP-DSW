import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { Afiliacion } from './afiliacion.entity.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { sendHttpError } from '../shared/http-errors.js';

const em = orm.em;

function sanitizeAfiliacionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fechaInicio: req.body.fechaInicio,
    fechaFin: req.body.fechaFin,
    tipo: req.body.tipo,
    socio: req.body.socio,
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
    const afiliaciones = await em.find(Afiliacion, {}, { populate: ['socio'] }); 
    res.status(200).json({ message: 'Todas las afiliaciones encontradas', data: afiliaciones });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const afiliacion = await em.findOneOrFail(Afiliacion, { id }, { populate: ['socio'] });
    res.status(200).json({ message: 'Afiliación encontrada', data: afiliacion });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Afiliación no encontrada' });
    } else {
      sendHttpError(error, req, res);
    }
  }
}

async function add(req: Request, res: Response) {
  try {
    // Validar datos antes de crear la afiliación
    const afiliacionInstance = plainToInstance(Afiliacion, req.body.sanitizedInput);
    const errors = await validate(afiliacionInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const afiliacion = em.create(Afiliacion, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Afiliación creada correctamente', data: afiliacion });
  } catch (error: any) {
    sendHttpError(error, req, res);
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const afiliacionToUpdate = await em.findOneOrFail(Afiliacion, { id });

    // Validar datos nuevos
    const afiliacionInstance = plainToInstance(Afiliacion, req.body.sanitizedInput);
    const errors = await validate(afiliacionInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(afiliacionToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'Afiliación actualizada correctamente', data: afiliacionToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Afiliación no encontrada' });
    } else {
      sendHttpError(error, req, res);
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const afiliacionToRemove = await em.findOneOrFail(Afiliacion, { id });
    await em.removeAndFlush(afiliacionToRemove);
    res.status(200).json({ message: 'Afiliación eliminada correctamente' });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Afiliación no encontrada' });
    } else {
      sendHttpError(error, req, res);
    }
  }
}

export { sanitizeAfiliacionInput, findAll, findOne, add, update, remove };