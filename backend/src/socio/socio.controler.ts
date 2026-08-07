import { Request, Response, NextFunction } from 'express';
import { Socio } from './socio.entity.js';
import { orm } from '../shared/orm.js';
import { Afiliacion } from '../afiliacion/afiliacion.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const em = orm.em;

// Middleware opcional de sanitización (limpia el body)
function sanitizeSocioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    dni: req.body.dni,
    email: req.body.email,
    telefono: req.body.telefono,
    tipoAfiliacion: req.body.tipoAfiliacion,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// Obtener todos los socios
async function findAll(req: Request, res: Response) {
  try {
    const socios = await em.find(Socio, {}, { populate: ['embarcaciones', 'afiliaciones'] });
    res.status(200).json({ message: 'Socios encontrados', data: socios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener un socio por ID
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const socio = await em.findOne(Socio, { id }, { populate: ['embarcaciones', 'afiliaciones'] });

    if (!socio) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    res.status(200).json({ message: 'Socio encontrado', data: socio });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Crear nuevo socio
async function add(req: Request, res: Response) {
  try {
    // Validar datos antes de crear el socio
    const socioInstance = plainToInstance(Socio, req.body);
    const errors = await validate(socioInstance);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    // Crear el socio (el hook BeforeCreate se encarga del hash)
    const newSocio = em.create(Socio, req.body);
    await em.persistAndFlush(newSocio);

    // Crear afiliación automática si se envía tipoAfiliacion
    if (req.body.tipoAfiliacion) {
      const afiliacion = em.create(Afiliacion, {
        fechaInicio: new Date(),
        tipo: req.body.tipoAfiliacion,
        socio: newSocio,
      });
      await em.persistAndFlush(afiliacion);
    }

    res.status(201).json({
      message: 'Socio creado correctamente (contraseña generada a partir del DNI)',
      data: newSocio,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar socio
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const socioToUpdate = await em.findOne(Socio, { id });

    if (!socioToUpdate) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    // Validar datos nuevos
    const socioInstance = plainToInstance(Socio, req.body);
    const errors = await validate(socioInstance, { skipMissingProperties: true });

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      return res.status(400).json({ message: 'Error de validación', errors: messages });
    }

    em.assign(socioToUpdate, req.body);
    await em.flush();

    res.status(200).json({ message: 'Socio actualizado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Eliminar socio
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const socioToRemove = await em.findOne(Socio, { id });

    if (!socioToRemove) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    await em.removeAndFlush(socioToRemove);
    res.status(200).json({ message: 'Socio eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function bajaLogica(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const result = await em.transactional(async (em1) => {
      //  socio + afiliación activa
      const socio = await em1.findOne(Socio, { id });
      if (!socio) {
        return res.status(404).json({ message: 'Socio no encontrado' });
      }

      const afiliacionActiva = await em1.findOne(Afiliacion, {
        socio: id,
        fechaFin: null,
      });
      if (!afiliacionActiva) {
        return res.status(400).json({ message: 'El socio no tiene una afiliación activa' });
      }

      //  cerrar afiliación
      afiliacionActiva.fechaFin = new Date();
      await em1.persist(afiliacionActiva);

      //  obtener embarcaciones del socio
      const embarcaciones = await em1.find(Embarcacion, { socio: id });

      // 4) eliminar embarcaciones (si existen)
      for (const e of embarcaciones) {
        em1.remove(e);
      }

      await em1.flush();

    });

    return res.status(200).json({
      message: 'Baja lógica realizada y embarcaciones eliminadas',
      data: result,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Error en la baja lógica', error: error.message });
  }
}

async function getSociosActivos(req: Request, res: Response){
  

}


export { sanitizeSocioInput, findAll, findOne, add, update, remove, bajaLogica };
