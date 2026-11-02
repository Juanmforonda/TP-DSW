import { Router, Request, Response } from 'express';
import { login } from './auth.service.js';
import { AuthError, ValidationError } from './auth.errors.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

function sanitizeLoginInput(input: unknown) {
  if (typeof input !== 'object' || input === null) return { email: '', password: '' };

  const { email, password } = input as { email?: string; password?: string };

  return {
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    password: typeof password === 'string' ? password.trim() : '',
  };
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const resultado = await login(req.body?.email, req.body?.password);
    return res.json(resultado);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof AuthError) {
      return res.status(401).json({ message: error.message });
    }

    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export const authRouter = router;
