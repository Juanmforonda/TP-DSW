import { Router } from 'express'
import { findAll, findOne, add, update, cambiarPassword, remove, bajaLogica } from './socio.controler.js'

export const socioRouter = Router()

socioRouter.get('/', findAll)
socioRouter.get('/:id', findOne)
socioRouter.post('/', add)
socioRouter.put('/baja-logica/:id', bajaLogica)
socioRouter.patch('/:id/password', cambiarPassword)
socioRouter.put('/:id', update)
socioRouter.delete('/:id', remove)