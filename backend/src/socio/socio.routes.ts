import { Router } from 'express';

import {
  findAll,
  findOne,
  add,
  update,
  remove,
  bajaLogica,
  cambiarPassword,
} from './socio.controller.js';
import { requireRole, setAuthenticatedId } from '../auth/auth.middleware.js';

export const socioRouter = Router();

socioRouter.get('/me', requireRole('socio'), setAuthenticatedId('id'), findOne);
socioRouter.put('/me', requireRole('socio'), setAuthenticatedId('id'), update);
socioRouter.patch('/me/password', requireRole('socio'), setAuthenticatedId('id'), cambiarPassword);

socioRouter.get('/', requireRole('admin'), findAll);
socioRouter.get('/:id', requireRole('admin'), findOne);
socioRouter.post('/', requireRole('admin'), add);
socioRouter.put('/baja-logica/:id', requireRole('admin'), bajaLogica);
socioRouter.put('/:id', requireRole('admin'), update);
socioRouter.delete('/:id', requireRole('admin'), remove);
