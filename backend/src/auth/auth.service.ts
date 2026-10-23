import { orm } from '../shared/orm.js';
import { Socio } from '../socio/socio.entity.js';
import { Administrador } from '../administrador/administrador.entity.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(
  email: string,
  password: string
) {

  const em = orm.em.fork();

  const socio = await em.findOne(Socio, { email });

  if (!socio) {

    const admin = await em.findOne(
      Administrador,
      { email }
    );

    if (!admin) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValida =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!passwordValida) {
      throw new Error(
        'Contraseña incorrecta'
      );
    }

    const token = jwt.sign(
      {
        id: admin.id,
        tipo: 'admin'
      },
      'clave_secreta',
      {
        expiresIn: '1h'
      }
    );

    return {
      token,
      tipo: 'admin',
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
      },
    };
  }

  const passwordValida =
    await bcrypt.compare(
      password,
      socio.password
    );

  if (!passwordValida) {
    throw new Error(
      'Contraseña incorrecta'
    );
  }

  const token = jwt.sign(
    {
      id: socio.id,
      tipo: 'socio'
    },
    'clave_secreta',
    {
      expiresIn: '1h'
    }
  );

  return {
    token,
    tipo: 'socio',
    socio: {
      id: socio.id,
      nombre: socio.nombre,
      apellido: socio.apellido,
      email: socio.email,
    },
  };
}
