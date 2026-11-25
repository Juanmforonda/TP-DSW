import { Router } from 'express';
import {
  sanitizeReservaInfraestructuraInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  cancel,
  finalizar,
  findByEmbarcacion,
  findBySocio,
} from './reservaInfraestructura.controller.js';
import { requireRole, setAuthenticatedId } from '../auth/auth.middleware.js';

export const reservaInfraestructuraRouter = Router();

reservaInfraestructuraRouter.get('/me', requireRole('socio'), setAuthenticatedId('idSocio'), findBySocio);
reservaInfraestructuraRouter.get('/', requireRole('admin'), findAll);
reservaInfraestructuraRouter.get('/embarcacion/:idEmbarcacion', requireRole('admin'), findByEmbarcacion);
reservaInfraestructuraRouter.post('/:id/cancelar', requireRole('admin'), cancel);
reservaInfraestructuraRouter.post('/:id/finalizar', requireRole('admin'), finalizar);
reservaInfraestructuraRouter.get('/:id', requireRole('admin'), findOne);
reservaInfraestructuraRouter.post('/', requireRole('admin'), sanitizeReservaInfraestructuraInput, add);
reservaInfraestructuraRouter.put('/:id', requireRole('admin'), sanitizeReservaInfraestructuraInput, update);
reservaInfraestructuraRouter.delete('/:id', requireRole('admin'), remove);
