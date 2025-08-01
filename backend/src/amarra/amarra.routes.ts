import { Router } from 'express';
import { findAll, findOne, add, update, remove  } from './amarra.controller.js';


export const amarraRouter = Router()

amarraRouter.get('/', findAll)
amarraRouter.get('/:id', findOne)
amarraRouter.post('/', add)
amarraRouter.put('/:id', update)
amarraRouter.delete('/:id', remove)