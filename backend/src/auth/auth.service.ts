import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/orm.js';
import { Socio } from '../socio/socio.entity.js';
import { Administrador } from '../administrador/administrador.entity.js';
import { AuthError, ValidationError } from './auth.errors.js';
import { JWT_SECRET } from './auth.config.js';

type Tipo = 'socio' | 'admin';

// Recibe unknown, el service no puede confiar en lo que le pase
// el router (ni un test)
function sanitizeLoginInput(email: unknown, password: unknown) {
  return {
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    password: typeof password === 'string' ? password : '',
  };
}

function firmarToken(id: unknown, tipo: Tipo) {
  return jwt.sign({ id, tipo }, JWT_SECRET, { expiresIn: '1h' });
}

async function verificarPassword(plano: string, hash: string) {
  const valida = await bcrypt.compare(plano, hash);
  if (!valida) throw new AuthError();
}

export async function login(email: unknown, password: unknown) {
  const input = sanitizeLoginInput(email, password);

  if (
    !input.email ||
    !input.password ||
    input.password.length < 6 ||
    input.email.length > 255
  ) {
    throw new ValidationError();
  }

  const em = orm.em.fork();

  const socio = await em.findOne(
    Socio,
    { email: input.email },
    { populate: ['afiliaciones'] },
  );
  
  if (socio) {
    await verificarPassword(input.password, socio.password);

    if (!socio.activo) throw new AuthError();

    return {
      token: firmarToken(socio.id, 'socio'),
      tipo: 'socio' as const,
      socio: {
        id: socio.id,
        nombre: socio.nombre,
        apellido: socio.apellido,
        email: socio.email,
      },
    };
  }

  const admin = await em.findOne(Administrador, { email: input.email });
  if (!admin) throw new AuthError();

  await verificarPassword(input.password, admin.password);

  return {
    token: firmarToken(admin.id, 'admin'),
    tipo: 'admin' as const,
    admin: {
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      email: admin.email,
    },
  };
}
