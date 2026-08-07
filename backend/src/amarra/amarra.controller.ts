import { Request, Response, NextFunction } from 'express';
import { Amarra, Estado as EstadoAmarra } from './amarra.entity.js';
import { orm } from '../shared/orm.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';

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
    if (req.body.sanitizedInput[key] === undefined || Number.isNaN(req.body.sanitizedInput[key])) {
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

    const amarras = await em.find(Amarra, where, {
      populate: [
        'reservasInfraestructura',
        'reservasInfraestructura.embarcacion',
        'reservasInfraestructura.socio',
      ],
    });

    res.status(200).json({
      message:
        Object.keys(where).length > 0
          ? `Amarras filtradas por ${Object.keys(where).join(' y ')}`
          : 'Todas las amarras',
      data: amarras
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al buscar amarras',
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const amarra = await em.findOneOrFail(Amarra, { id }, {
      populate: [
        'reservasInfraestructura',
        'reservasInfraestructura.embarcacion',
        'reservasInfraestructura.socio',
      ],
    });
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
    const amarraToUpdate = await em.findOneOrFail(Amarra, { id }, { populate: ['reservasInfraestructura'] });

    if (req.body.embarcacion !== undefined) {
      return res.status(400).json({
        message: 'La asignación de embarcaciones a infraestructura ahora se hace por reservas',
      });
    }

    const amarraInstance = plainToInstance(Amarra, req.body);
    const errors = await validate(amarraInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const hayReservaActiva = amarraToUpdate.reservasInfraestructura
      .getItems()
      .some((r) => r.estado === EstadoReservaInfraestructura.ACTIVA && !r.fechaFin);
    if (hayReservaActiva && req.body.estado && req.body.estado !== EstadoAmarra.OCUPADO) {
      return res.status(400).json({
        message: 'No se puede cambiar estado: la amarra tiene una reserva activa',
      });
    }

    em.assign(amarraToUpdate, req.body);
    await em.flush();
    res.status(200).json({ message: 'Amarra actualizada correctamente', data: amarraToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Amarra no encontrada' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const amarraToRemove = await em.findOneOrFail(Amarra, { id }, { populate: ['reservasInfraestructura'] });
    const hayReservaActiva = amarraToRemove.reservasInfraestructura
      .getItems()
      .some((r) => r.estado === EstadoReservaInfraestructura.ACTIVA && !r.fechaFin);

    if (hayReservaActiva) {
      return res.status(409).json({
        message: 'No se puede eliminar una amarra con reserva activa',
      });
    }

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

