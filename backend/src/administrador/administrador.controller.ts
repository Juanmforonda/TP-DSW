import { Request, Response, NextFunction } from "express";
import { Administrador } from "./administrador.entity.js";
import { orm } from "../shared/orm.js";
import bcrypt from "bcrypt";
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { filtrarCampos, camposNoPermitidos } from '../shared/whitelist.js';
import { validarFortalezaPassword } from '../shared/password.js';


const em = orm.em;

const CAMPOS_EDITABLES_ADMIN = ['nombre', 'apellido', 'email'] as const;


function sanitizeAdministradorInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        dni: req.body.dni,
        password: req.body.password,
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
        const administradores = await em.find(Administrador, {});
        res.status(200).json({ message: 'Todos los administradores encontrados', data: administradores });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


async function findOne(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);
        const administrador = await em.findOneOrFail(Administrador, { id });
        res.status(200).json({ message: 'Administrador encontrado', data: administrador });
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            res.status(404).json({ message: 'Administrador no encontrado' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
}


async function add(req: Request, res: Response) {
    try {
        // En el alta se permite dni (la contraseña inicial se genera a partir de él en el hook)
        const { datos, rechazados } = filtrarCampos(req.body, [...CAMPOS_EDITABLES_ADMIN, 'dni']);
        if (rechazados.length > 0) {
            return camposNoPermitidos(res, rechazados);
        }

        const administradorInstance = plainToInstance(Administrador, datos);
        const errors = await validate(administradorInstance);


        if (errors.length > 0) {
            const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
            return res.status(400).json({ message: 'Error de validación', errors: messages });
        }


        const newAdministrador = em.create(Administrador, datos as any);
        await em.flush();
        res.status(201).json({
            message: 'Administrador creado correctamente (contraseña generada a partir del DNI)',
            data: newAdministrador
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


async function update(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);
        const administradorToUpdate = await em.findOneOrFail(Administrador, { id });

        const { datos, rechazados } = filtrarCampos(req.body, CAMPOS_EDITABLES_ADMIN);
        if (rechazados.length > 0) {
            return camposNoPermitidos(res, rechazados);
        }
        if (Object.keys(datos).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
        }


        // Validar datos nuevos
        const administradorInstance = plainToInstance(Administrador, datos);
        const errors = await validate(administradorInstance, { skipMissingProperties: true });


        if (errors.length > 0) {
            const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
            return res.status(400).json({ message: 'Error de validación', errors: messages });
        }


        em.assign(administradorToUpdate, datos);
        await em.flush();


        res.status(200).json({ message: "Administrador actualizado correctamente" });
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            res.status(404).json({ message: 'Administrador no encontrado' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
}


// Cambiar contraseña: valida la actual, hashea la nueva, no toca otros campos
async function cambiarPassword(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);
        const { actual, nueva } = req.body ?? {};

        if (!actual || !nueva) {
            return res.status(400).json({ message: 'Debés enviar la contraseña actual y la nueva' });
        }

        const errorFortaleza = validarFortalezaPassword(nueva);
        if (errorFortaleza) {
            return res.status(400).json({ message: errorFortaleza });
        }

        const administrador = await em.findOne(Administrador, { id });
        if (!administrador) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        if (!(await bcrypt.compare(actual, administrador.password))) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
        }

        if (await bcrypt.compare(nueva, administrador.password)) {
            return res.status(400).json({ message: 'La nueva contraseña debe ser distinta de la actual' });
        }

        administrador.password = await bcrypt.hash(nueva, 10);
        await em.flush();

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}


async function remove(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);
        const administradorToRemove = await em.findOneOrFail(Administrador, { id });
        await em.removeAndFlush(administradorToRemove);
        res.status(200).json({ message: 'Administrador eliminado correctamente' });    
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            res.status(404).json({ message: 'Administrador no encontrado' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
}


export { sanitizeAdministradorInput, findAll, findOne, add, update, cambiarPassword, remove };