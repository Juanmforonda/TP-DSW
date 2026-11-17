import { Request, Response } from 'express';
import { orm } from '../shared/orm.js';
import { TipoEmbarcacion } from './tipoEmbarcacion.entity.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { filtrarCampos, camposNoPermitidos } from '../shared/whitelist.js';


const em = orm.em;
em.getRepository(TipoEmbarcacion);

// TODO: ajustar a las propiedades editables reales de TipoEmbarcacion
const CAMPOS_EDITABLES_TIPO = ['nombre', 'descripcion'] as const;


async function findAll(req: Request, res: Response) {
  try {
    const tiposEmbarcacion = await em.find(TipoEmbarcacion, {});
    res.status(200).json({ message: 'Tipos de embarcación encontrados', data: tiposEmbarcacion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipo = await em.findOne(TipoEmbarcacion, { id });


    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de embarcación no encontrado' });
    }


    res.status(200).json({ message: 'Tipo de embarcación encontrado', data: tipo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


async function add(req: Request, res: Response) {
  try {
    const { datos, rechazados } = filtrarCampos(req.body, CAMPOS_EDITABLES_TIPO);
    if (rechazados.length > 0) {
      return camposNoPermitidos(res, rechazados);
    }

    // Validar los datos antes de crear
    const tipoInstance = plainToInstance(TipoEmbarcacion, datos);
    const errors = await validate(tipoInstance);


    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }


    // Crear y guardar
    const newTipo = em.create(TipoEmbarcacion, datos as any);
    await em.persistAndFlush(newTipo);


    res.status(201).json({ message: 'Tipo de embarcación creado correctamente', data: newTipo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipo = await em.findOne(TipoEmbarcacion, { id });


    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de embarcación no encontrado' });
    }

    const { datos, rechazados } = filtrarCampos(req.body, CAMPOS_EDITABLES_TIPO);
    if (rechazados.length > 0) {
      return camposNoPermitidos(res, rechazados);
    }
    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
    }


    // Validar los nuevos datos
    const tipoInstance = plainToInstance(TipoEmbarcacion, datos);
    const errors = await validate(tipoInstance, { skipMissingProperties: true });


    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }


    em.assign(tipo, datos);
    await em.flush();


    res.status(200).json({ message: 'Tipo de embarcación actualizado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipo = await em.findOne(TipoEmbarcacion, { id });


    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de embarcación no encontrado' });
    }


    await em.removeAndFlush(tipo);
    res.status(200).json({ message: 'Tipo de embarcación eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


export { findAll, findOne, add, update, remove };