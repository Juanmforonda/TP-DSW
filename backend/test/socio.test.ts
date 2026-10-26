import { describe, expect, it } from 'vitest'

describe('Socio activo', () => {

  it('debe ser activo si tiene una afiliacion vigente', () => {

    const afiliaciones = [
      { fechaFin: null }
    ]

    const activo =
      afiliaciones.some(a => !a.fechaFin)

    expect(activo).toBe(true)

  })
})