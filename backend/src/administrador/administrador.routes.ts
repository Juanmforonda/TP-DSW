import { Router } from 'express'
import { findAll, findOne, add, update, cambiarPassword, remove } from './administrador.controller.js'
import { setAuthenticatedId } from '../auth/auth.middleware.js'


export const administradorRouter = Router()


administradorRouter.get('/', findAll)
administradorRouter.get('/me', setAuthenticatedId('id'), findOne)
administradorRouter.put('/me', setAuthenticatedId('id'), update)
administradorRouter.patch('/me/password', setAuthenticatedId('id'), cambiarPassword)
administradorRouter.get('/:id', findOne)
administradorRouter.post('/', add)
administradorRouter.patch('/:id/password', cambiarPassword)
administradorRouter.put('/:id', update)
administradorRouter.delete('/:id', remove)