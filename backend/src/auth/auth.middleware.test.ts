import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { AUTH_COOKIE_NAME } from './auth.cookie.js';
import { JWT_SECRET } from './auth.config.js';
import {
  requireAuth,
  requireRole,
  requireTrustedOrigin,
} from './auth.middleware.js';
import { allowedOrigins } from '../shared/allowed-origins.js';

function makeRequest({
  method = 'GET',
  cookie,
  origin,
  authorization,
}: {
  method?: string;
  cookie?: string;
  origin?: string;
  authorization?: string;
} = {}) {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  if (origin) headers.origin = origin;
  if (authorization) headers.authorization = authorization;

  return {
    method,
    headers,
    header: (name: string) => headers[name.toLowerCase()],
    params: {},
  } as unknown as Request;
}

function makeResponse() {
  return {
    clearCookie: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('autenticación mediante cookie', () => {
  it('acepta un JWT válido desde la cookie HttpOnly', () => {
    const token = jwt.sign({ id: 42, tipo: 'socio' }, JWT_SECRET);
    const req = makeRequest({
      cookie: `${AUTH_COOKIE_NAME}=${token}`,
    }) as Request & { user?: { id: string | number; tipo: string } };
    const res = makeResponse();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ id: 42, tipo: 'socio' });
    expect(next).toHaveBeenCalledOnce();
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it('rechaza un bearer token sin cookie y limpia la cookie', () => {
    const req = makeRequest({
      authorization: 'Bearer legacy-token',
    });
    const res = makeResponse();

    requireAuth(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('limpia una cookie con un JWT expirado', () => {
    const token = jwt.sign({ id: 42, tipo: 'socio' }, JWT_SECRET, {
      expiresIn: -1,
    });
    const req = makeRequest({
      cookie: `${AUTH_COOKIE_NAME}=${token}`,
    });
    const res = makeResponse();

    requireAuth(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.clearCookie).toHaveBeenCalledOnce();
  });

  it('no borra la sesión ante un 403 por falta de rol', () => {
    const req = makeRequest() as Request & {
      user: { id: number; tipo: 'socio' };
    };
    req.user = { id: 42, tipo: 'socio' };
    const res = makeResponse();

    requireRole('admin')(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it('bloquea solicitudes mutables con origen no permitido', () => {
    const req = makeRequest({
      method: 'POST',
      origin: 'https://malicioso.example',
    });
    const res = makeResponse();
    const next = vi.fn() as unknown as NextFunction;

    requireTrustedOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('permite solicitudes mutables desde un origen configurado', () => {
    const req = makeRequest({
      method: 'POST',
      origin: allowedOrigins[0],
    });
    const res = makeResponse();
    const next = vi.fn() as unknown as NextFunction;

    requireTrustedOrigin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
