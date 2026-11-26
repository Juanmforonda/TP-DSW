import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import {
  requireRole,
  requireSelf,
  setAuthenticatedId,
  type AuthenticatedRequest,
} from '../src/auth/auth.middleware.js';

function makeResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

function makeRequest(user: AuthenticatedRequest['user'], params = {}) {
  return {
    user,
    params,
  } as unknown as AuthenticatedRequest;
}

describe('Autorización por rol', () => {
  it('rechaza a un socio con 403 en una operación administrativa', () => {
    const req = makeRequest({ id: 1, tipo: 'socio' });
    const res = makeResponse();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Permisos insuficientes' });
    expect(next).not.toHaveBeenCalled();
  });

  it('permite a un administrador ejecutar una operación administrativa', () => {
    const req = makeRequest({ id: 2, tipo: 'admin' });
    const res = makeResponse();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it.each(['admin', 'socio'] as const)(
    'permite a %s acceder a una operación compartida',
    (tipo) => {
      const req = makeRequest({ id: 1, tipo });
      const res = makeResponse();
      const next = vi.fn();

      requireRole('admin', 'socio')(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    },
  );
});

describe('Autorización de recursos propios', () => {
  it('rechaza que un socio consulte el recurso de otro socio', () => {
    const req = makeRequest({ id: 1, tipo: 'socio' }, { id: '99' });
    const res = makeResponse();
    const next = vi.fn();

    requireSelf('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('permite que un socio consulte su propio recurso', () => {
    const req = makeRequest({ id: 1, tipo: 'socio' }, { id: '1' });
    const res = makeResponse();
    const next = vi.fn();

    requireSelf('id')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('reemplaza el ID recibido por el ID autenticado en rutas /me', () => {
    const req = makeRequest({ id: 7, tipo: 'socio' }, {});
    const res = makeResponse();
    const next = vi.fn();

    setAuthenticatedId('idSocio')(req, res, next);

    expect(req.params).toEqual({ idSocio: '7' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('reemplaza un ID manipulable con el ID del token', () => {
    const req = makeRequest(
      { id: 12, tipo: 'socio' },
      { idSocio: '99' },
    );
    const res = makeResponse();
    const next = vi.fn();

    setAuthenticatedId('idSocio')(req, res, next);

    expect(req.params.idSocio).toBe('12');
    expect(next).toHaveBeenCalledOnce();
  });
});
