import {
  NotFoundError,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  errorHandler,
  HttpError,
  requestId,
  sendHttpError,
} from './http-errors.js';

function makeRequest() {
  return { method: 'GET', path: '/api/cuotas/1' } as Request;
}

function makeResponse() {
  return {
    locals: { requestId: 'request-123' },
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('Manejo seguro de errores HTTP', () => {
  it('responde errores de dominio con su estado y mensaje seguros', () => {
    const req = makeRequest();
    const res = makeResponse();

    sendHttpError(new HttpError(409, 'La cuota ya está pagada'), req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'La cuota ya está pagada' });
  });

  it('convierte recursos inexistentes en 404 sin exponer el detalle del ORM', () => {
    const req = makeRequest();
    const res = makeResponse();
    const error = NotFoundError.findOneFailed('CuotaMensual', { id: 1 });

    sendHttpError(error, req, res, 'Cuota no encontrada');

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cuota no encontrada' });
  });

  it('convierte conflictos de unicidad en 409 sin exponer el detalle de la BD', () => {
    const req = makeRequest();
    const res = makeResponse();
    const error = new UniqueConstraintViolationException(new Error('duplicate key'));

    sendHttpError(error, req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El recurso entra en conflicto con uno existente',
    });
  });

  it('responde con 400 cuando el JSON recibido no puede parsearse', () => {
    const req = makeRequest();
    const res = makeResponse();

    sendHttpError({ type: 'entity.parse.failed', message: 'sensitive body' }, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El cuerpo de la solicitud no es válido',
    });
  });

  it('oculta errores inesperados y los registra con el identificador de solicitud', () => {
    const req = makeRequest();
    const res = makeResponse();
    const error = new Error('SQL internals');
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
    expect(log).toHaveBeenCalledWith(
      'Error no controlado',
      expect.objectContaining({ requestId: 'request-123', error }),
    );
    log.mockRestore();
  });

  it('asigna un identificador de solicitud a la respuesta', () => {
    const req = makeRequest();
    const res = makeResponse();
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      expect.stringMatching(/^[0-9a-f-]{36}$/i),
    );
    expect(next).toHaveBeenCalledOnce();
  });
});
