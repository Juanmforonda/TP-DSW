import { Router } from 'express';
import {
  sanitizeReservaTravelLiftInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  cancel,
  finalizar,
  findBySocio,
} from './reservaTravelLift.controller.js';
import { requireRole, requireSelf, setAuthenticatedId } from '../auth/auth.middleware.js';

export const reservaTravelLiftRouter = Router();

reservaTravelLiftRouter.get('/me', setAuthenticatedId('idSocio'), findBySocio);
reservaTravelLiftRouter.get('/socio/:idSocio', requireSelf('idSocio'), findBySocio);
reservaTravelLiftRouter.get('/', requireRole('admin'), findAll);
reservaTravelLiftRouter.post('/:id/cancelar', cancel);
reservaTravelLiftRouter.post('/:id/finalizar', requireRole('admin'), finalizar);
reservaTravelLiftRouter.get('/:id', requireRole('admin'), findOne);
reservaTravelLiftRouter.post('/', sanitizeReservaTravelLiftInput, add);
reservaTravelLiftRouter.put('/:id', sanitizeReservaTravelLiftInput, update);
reservaTravelLiftRouter.delete('/:id', requireRole('admin'), remove);
