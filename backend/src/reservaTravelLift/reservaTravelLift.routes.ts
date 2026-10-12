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

export const reservaTravelLiftRouter = Router();

reservaTravelLiftRouter.get('/', findAll);
reservaTravelLiftRouter.get('/socio/:idSocio', findBySocio);
reservaTravelLiftRouter.post('/:id/cancelar', cancel);
reservaTravelLiftRouter.post('/:id/finalizar', finalizar);
reservaTravelLiftRouter.get('/:id', findOne);
reservaTravelLiftRouter.post('/', sanitizeReservaTravelLiftInput, add);
reservaTravelLiftRouter.put('/:id', sanitizeReservaTravelLiftInput, update);
reservaTravelLiftRouter.delete('/:id', remove);
