import { Router } from 'express';
import { sanitizeAmarraInput, findAll, findOne, add, update, remove } from './amarra.controller.js';


export const amarraRouter = Router()

amarraRouter.get('/', findAll)
amarraRouter.get('/:id', findOne)
amarraRouter.post('/', sanitizeAmarraInput, add)
amarraRouter.put('/:id', sanitizeAmarraInput, update)
amarraRouter.delete('/:id', remove)