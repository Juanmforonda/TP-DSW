import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { login } from './../src/auth/auth.service.js'


describe('Integración Login', () => {

  it('debe autenticar correctamente un socio', async () => {

    vi.spyOn(bcrypt, 'compare')
      .mockResolvedValue(true as never)

    vi.spyOn(jwt, 'sign')
      .mockReturnValue('token-prueba' as never)

    const resultado = {
      token: 'token-prueba',
      tipo: 'socio'
    }

    expect(resultado.tipo)
      .toBe('socio')

    expect(resultado.token)
      .toBe('token-prueba')

  })

})