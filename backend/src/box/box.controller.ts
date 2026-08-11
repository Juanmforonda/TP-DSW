import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/orm.js';
import { Box, Estado as EstadoBox } from './box.entity.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';

function sanitizeBoxInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    estado: req.body.estado,
    nroBox: req.body.nroBox !== undefined ? String(req.body.nroBox) : undefined,
    precioMensualBase:
      req.body.precioMensualBase !== undefined ? Number(req.body.precioMensualBase) : undefined,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (
      req.body.sanitizedInput[key] === undefined ||
      Number.isNaN(req.body.sanitizedInput[key])
    ) {
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

    const boxes = await em.find(Box, where, {
      populate: [
        'reservasInfraestructura',
        'reservasInfraestructura.embarcacion',
        'reservasInfraestructura.socio',
      ],
    });

    res.status(200).json({
      message: estado ? `Boxes filtrados por estado: ${estado}` : 'Todos los boxes',
      data: boxes
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al buscar boxes',
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const box = await em.findOneOrFail(Box, { id }, {
      populate: [
        'reservasInfraestructura',
        'reservasInfraestructura.embarcacion',
        'reservasInfraestructura.socio',
      ],
    });
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
    const input = req.body.sanitizedInput ?? req.body;
    const boxInstance = plainToInstance(Box, input);
    const errors = await validate(boxInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const newBox = em.create(Box, input);
    await em.persistAndFlush(newBox);
    res.status(201).json({ message: 'Box creado correctamente', data: newBox });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al crear box',
      error: error.message,
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const boxToUpdate = await em.findOneOrFail(Box, { id }, { populate: ['reservasInfraestructura'] });

    if (req.body.embarcacion !== undefined) {
      return res.status(400).json({
        message: 'La asignación de embarcaciones a infraestructura ahora se hace por reservas',
      });
    }

    const input = req.body.sanitizedInput ?? req.body;
    const boxInstance = plainToInstance(Box, input);
    const errors = await validate(boxInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    const hayReservaActiva = boxToUpdate.reservasInfraestructura
      .getItems()
      .some((r) => r.estado === EstadoReservaInfraestructura.ACTIVA && !r.fechaFin);
    if (hayReservaActiva && input.estado && input.estado !== EstadoBox.OCUPADO) {
      return res.status(400).json({
        message: 'No se puede cambiar estado: el box tiene una reserva activa',
      });
    }

    em.assign(boxToUpdate, input);
    await em.flush();
    res.status(200).json({ message: 'Box actualizado correctamente', data: boxToUpdate });
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      res.status(404).json({ message: 'Box no encontrado' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const boxToRemove = await em.findOneOrFail(Box, { id }, { populate: ['reservasInfraestructura'] });
    const hayReservaActiva = boxToRemove.reservasInfraestructura
      .getItems()
      .some((r) => r.estado === EstadoReservaInfraestructura.ACTIVA && !r.fechaFin);

    if (hayReservaActiva) {
      return res.status(409).json({
        message: 'No se puede eliminar un box con reserva activa',
      });
    }

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

