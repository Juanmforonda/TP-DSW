import {
  NotFoundError,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import type { ErrorRequestHandler, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: 400 | 401 | 403 | 404 | 409 | 413,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function requestId(_req: Request, res: Response, next: () => void) {
  const id = randomUUID();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

export function sendHttpError(
  error: unknown,
  req: Request,
  res: Response,
  notFoundMessage = 'Recurso no encontrado',
) {
  if (res.headersSent) return;

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ message: notFoundMessage });
  }

  if (error instanceof UniqueConstraintViolationException) {
    return res.status(409).json({ message: 'El recurso entra en conflicto con uno existente' });
  }

  if (
    isBodyParserError(error, 'entity.parse.failed') ||
    isBodyParserError(error, 'request.size.invalid')
  ) {
    return res.status(400).json({ message: 'El cuerpo de la solicitud no es válido' });
  }

  if (isBodyParserError(error, 'entity.too.large')) {
    return res.status(413).json({ message: 'El cuerpo de la solicitud supera el tamaño permitido' });
  }

  console.error('Error no controlado', {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.path,
    error,
  });
  return res.status(500).json({ message: 'Error interno del servidor' });
}

function isBodyParserError(error: unknown, type: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === type
  );
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  return sendHttpError(error, req, res);
};
