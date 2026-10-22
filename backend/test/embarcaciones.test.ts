import { describe, it, expect } from 'vitest'
import { validarUbicacionExclusiva } from '../src/embarcacion/embarcacion.rules'

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

  it('debe aceptar una amarra sin box', () => {
    expect(() =>
      validarUbicacionExclusiva(1, null)
    ).not.toThrow()
  })

  it('debe aceptar un box sin amarra', () => {
    expect(() =>
      validarUbicacionExclusiva(null, 1)
    ).not.toThrow()
  })

})