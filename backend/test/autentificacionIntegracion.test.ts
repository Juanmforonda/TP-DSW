import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

vi.mock('./../src/shared/orm.js', () => ({
  orm: {
    em: {
      fork: vi.fn(),
    },
  },
}))

import { login } from './../src/auth/auth.service.js'
import { AuthError } from './../src/auth/auth.errors.js'
import { orm } from './../src/shared/orm.js'
import { Socio } from './../src/socio/socio.entity.js'
import { Administrador } from './../src/administrador/administrador.entity.js'

describe('Integración Login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(orm.em.fork).mockReset()
  })

  it('debe autenticar correctamente un socio', async () => {
    const socio = Object.assign(new Socio(), {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@gmail.com',
      password: 'hash-socio',
    })
    const findOne = vi.fn()
    const entityManager = {
      findOne,
    } as unknown as ReturnType<typeof orm.em.fork>
    Object.defineProperty(socio, 'activo', { value: true })

    vi.mocked(orm.em.fork).mockReturnValue(entityManager)
    findOne.mockResolvedValueOnce(socio)
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
    vi.spyOn(jwt, 'sign').mockReturnValue('token-prueba' as never)

    const resultado = await login(' JUAN@gmail.COM ', '123456')

    expect(resultado).toEqual({
      token: 'token-prueba',
      tipo: 'socio',
      socio: {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@gmail.com',
      },
    })
    expect(findOne).toHaveBeenCalledWith(
      Socio,
      { email: 'juan@gmail.com' },
      { populate: ['afiliaciones'] },
    )
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash-socio')
    expect(jwt.sign).toHaveBeenCalled()
  })

  it('debe autenticar correctamente un administrador', async () => {
    const administrador = Object.assign(new Administrador(), {
      id: 2,
      nombre: 'Ana',
      apellido: 'Gómez',
      email: 'ana@gmail.com',
      password: 'hash-admin',
    })
    const findOne = vi.fn()
    const entityManager = {
      findOne,
    } as unknown as ReturnType<typeof orm.em.fork>

    vi.mocked(orm.em.fork).mockReturnValue(entityManager)
    findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(administrador)
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
    vi.spyOn(jwt, 'sign').mockReturnValue('token-admin' as never)

    const resultado = await login('ana@gmail.com', '123456')

    expect(resultado).toEqual({
      token: 'token-admin',
      tipo: 'admin',
      admin: {
        id: 2,
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@gmail.com',
      },
    })
    expect(findOne).toHaveBeenNthCalledWith(
      1,
      Socio,
      { email: 'ana@gmail.com' },
      { populate: ['afiliaciones'] },
    )
    expect(findOne).toHaveBeenNthCalledWith(2, Administrador, {
      email: 'ana@gmail.com',
    })
  })

  it('debe rechazar credenciales incorrectas', async () => {
    const socio = Object.assign(new Socio(), {
      id: 1,
      email: 'juan@gmail.com',
      password: 'hash-socio',
    })
    const findOne = vi.fn()
    const entityManager = {
      findOne,
    } as unknown as ReturnType<typeof orm.em.fork>

    vi.mocked(orm.em.fork).mockReturnValue(entityManager)
    findOne.mockResolvedValueOnce(socio)
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)
    vi.spyOn(jwt, 'sign')

    await expect(login('juan@gmail.com', '123456')).rejects.toThrow(AuthError)
    expect(jwt.sign).not.toHaveBeenCalled()
  })

  it('debe rechazar el acceso de un socio inactivo', async () => {
    const socio = Object.assign(new Socio(), {
      id: 1,
      email: 'juan@gmail.com',
      password: 'hash-socio',
    })
    const findOne = vi.fn()
    const entityManager = {
      findOne,
    } as unknown as ReturnType<typeof orm.em.fork>

    vi.mocked(orm.em.fork).mockReturnValue(entityManager)
    findOne.mockResolvedValueOnce(socio)
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
    vi.spyOn(jwt, 'sign')

    await expect(login('juan@gmail.com', '123456')).rejects.toThrow(AuthError)
    expect(jwt.sign).not.toHaveBeenCalled()
  })
})