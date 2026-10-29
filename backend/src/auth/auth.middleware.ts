import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from './auth.config.js';

type Tipo = 'socio' | 'admin';

export type AuthenticatedRequest = Request & {
  user: {
    id: string | number;
    tipo: Tipo;
  };
};

function isJwtPayload(value: string | JwtPayload): value is JwtPayload {
  return typeof value !== 'string';
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.header('Authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
      !isJwtPayload(payload) ||
      (payload.tipo !== 'socio' && payload.tipo !== 'admin') ||
      (typeof payload.id !== 'string' && typeof payload.id !== 'number')
    ) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    (req as AuthenticatedRequest).user = {
      id: payload.id,
      tipo: payload.tipo,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }

    return res.status(401).json({ message: 'Token inválido' });
  }
}

export function requireRole(...roles: Tipo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || !roles.includes(user.tipo)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }

    return next();
  };
}
