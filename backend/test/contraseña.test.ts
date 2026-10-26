import { describe, it, expect } from 'vitest'
import bcrypt from 'bcrypt'
import { Socio } from '../src/socio/socio.entity'

describe('Contraseña de socio', () => {

  it('debe generar un hash usando los ultimos 6 digitos del DNI', async () => {

    const socio = new Socio()

    socio.dni = '40123456'

    await socio.hashPassword()

    expect(socio.password).toBeDefined()

    const coincide = await bcrypt.compare(
      '123456',
      socio.password
    )

    expect(coincide).toBe(true)

  })

})