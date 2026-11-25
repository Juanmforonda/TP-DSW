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
  findAvailability,
} from './reservaTravelLift.controller.js';
import { requireRole, requireSelf, setAuthenticatedId } from '../auth/auth.middleware.js';

export const reservaTravelLiftRouter = Router();

reservaTravelLiftRouter.get('/me', requireRole('socio'), setAuthenticatedId('idSocio'), findBySocio);
reservaTravelLiftRouter.get('/socio/:idSocio', requireRole('socio'), requireSelf('idSocio'), findBySocio);
reservaTravelLiftRouter.get('/', requireRole('admin'), findAll);
reservaTravelLiftRouter.get('/disponibilidad', requireRole('admin', 'socio'), findAvailability);
reservaTravelLiftRouter.post('/:id/cancelar', requireRole('admin', 'socio'), cancel);
reservaTravelLiftRouter.post('/:id/finalizar', requireRole('admin', 'socio'), finalizar);
reservaTravelLiftRouter.get('/:id', requireRole('admin'), findOne);
reservaTravelLiftRouter.post('/', requireRole('admin', 'socio'), sanitizeReservaTravelLiftInput, add);
reservaTravelLiftRouter.put('/:id', requireRole('admin', 'socio'), sanitizeReservaTravelLiftInput, update);
reservaTravelLiftRouter.delete('/:id', requireRole('admin'), remove);
