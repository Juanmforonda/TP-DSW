import { Router, Request, Response } from 'express';
import { getAuthenticatedProfile, login } from './auth.service.js';
import { AuthError, ValidationError } from './auth.errors.js';
import {
  requireAuth,
  requireTrustedOrigin,
  AuthenticatedRequest,
} from './auth.middleware.js';
import { sendHttpError } from '../shared/http-errors.js';
import { clearAuthCookie, setAuthCookie } from './auth.cookie.js';

const router = Router();

router.post('/login', requireTrustedOrigin, async (req: Request, res: Response) => {
  try {
    const resultado = await login(req.body?.email, req.body?.password);
    setAuthCookie(res, resultado.token);
    return res.json({ tipo: resultado.tipo });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof AuthError) {
      return res.status(401).json({ message: error.message });
    }

    return sendHttpError(error, req, res);
  }
});

router.post('/auth/logout', requireTrustedOrigin, (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(204).end();
});

router.get('/auth/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getAuthenticatedProfile(
      (req as AuthenticatedRequest).user,
    );
    return res.json({ message: 'Perfil encontrado', data: profile });
  } catch (error) {
    if (error instanceof AuthError) {
      clearAuthCookie(res);
      return res.status(401).json({ message: error.message });
    }
    return sendHttpError(error, req, res);
  }
});

export const authRouter = router;
