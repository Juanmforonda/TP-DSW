import { describe, it, expect } from 'vitest'
import { validarUbicacionExclusiva } from '../src/embarcacion/embarcacion.controller'

describe('Ubicación exclusiva de embarcación', () => {

  it('debe lanzar error si no se asigna amarra ni box', () => {

    expect(() =>
      validarUbicacionExclusiva(null, null)
    ).toThrow()

  })

  it('debe lanzar error si se asignan amarra y box al mismo tiempo', () => {

    expect(() =>
      validarUbicacionExclusiva(1, 1)
    ).toThrow()

  })

})
