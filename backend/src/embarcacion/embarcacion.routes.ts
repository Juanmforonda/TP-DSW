import { Router } from 'express';
import {
  sanitizeEmbarcacionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  reactivar,
  findBySocio,
  findEmbarcacionesClub,
  cambiarUbicacion,
} from './embarcacion.controller.js';
import { requireRole, requireSelf, setAuthenticatedId } from '../auth/auth.middleware.js';

export const embarcacionRouter = Router();


embarcacionRouter.get('/club', findEmbarcacionesClub);
embarcacionRouter.get('/me', setAuthenticatedId('idSocio'), findBySocio);
embarcacionRouter.get('/socio/:idSocio', requireSelf('idSocio'), findBySocio);
embarcacionRouter.get('/', requireRole('admin'), findAll);
embarcacionRouter.get('/:id', requireRole('admin'), findOne);
embarcacionRouter.post('/', requireRole('admin'), sanitizeEmbarcacionInput, add);
embarcacionRouter.post('/:id/cambiar-ubicacion', requireRole('admin'), cambiarUbicacion);
embarcacionRouter.post('/:id/reactivar', requireRole('admin'), reactivar);
embarcacionRouter.put('/:id', requireRole('admin'), sanitizeEmbarcacionInput, update);
embarcacionRouter.delete('/:id', requireRole('admin'), remove);
