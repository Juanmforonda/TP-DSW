import { Router } from 'express'
import { findAll, findOne, add, update, remove, bajaLogica } from './socio.controller.js'

export const socioRouter = Router()

socioRouter.get('/', findAll)
socioRouter.get('/:id', findOne)
socioRouter.post('/', add)
socioRouter.put('/baja-logica/:id', bajaLogica)
socioRouter.put('/:id', update)
socioRouter.delete('/:id', remove)
