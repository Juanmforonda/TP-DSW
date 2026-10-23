import { Router, Request, Response } from 'express';
import { login } from './auth.service.js';

const router = Router();

router.post(
  '/login',
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const resultado =
        await login(
          req.body.email,
          req.body.password
        );

      return res.json(resultado);

    } catch (error: any) {

      if (
        error.message === 'Usuario no encontrado' ||
        error.message === 'Contraseña incorrecta'
      ) {

        return res.status(401).json({
          message: error.message
        });

      }

      return res.status(500).json({
        message: 'Error interno del servidor'
      });

    }
  }
);

export const authRouter = router;