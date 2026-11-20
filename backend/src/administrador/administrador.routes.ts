import { Router } from 'express'
import { findAll, findOne, add, update, cambiarPassword, remove } from './administrador.controller.js'


export const administradorRouter = Router()


administradorRouter.get('/', findAll)
administradorRouter.get('/:id', findOne)
administradorRouter.post('/', add)
administradorRouter.patch('/:id/password', cambiarPassword)
administradorRouter.put('/:id', update)
administradorRouter.delete('/:id', remove)