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
} from './reservaInfraestructura.controller.js';

export const reservaInfraestructuraRouter = Router();

reservaInfraestructuraRouter.get('/', findAll);
reservaInfraestructuraRouter.get('/embarcacion/:idEmbarcacion', findByEmbarcacion);
reservaInfraestructuraRouter.post('/:id/cancelar', cancel);
reservaInfraestructuraRouter.post('/:id/finalizar', finalizar);
reservaInfraestructuraRouter.get('/:id', findOne);
reservaInfraestructuraRouter.post('/', sanitizeReservaInfraestructuraInput, add);
reservaInfraestructuraRouter.put('/:id', sanitizeReservaInfraestructuraInput, update);
reservaInfraestructuraRouter.delete('/:id', remove);

