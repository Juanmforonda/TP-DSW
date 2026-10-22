import { describe, it, expect } from 'vitest'
import { validarFechas } from './reservaInfraestructura.rules'

describe('Validación de fechas de reserva', () => {

  it('debe aceptar una fecha de inicio sin fecha de fin', () => {

    expect(() =>
      validarFechas(
        new Date('2026-01-01'),
        null
      )
    ).not.toThrow()

  })

  it('debe aceptar fechas válidas en orden correcto', () => {

    expect(() =>
      validarFechas(
        new Date('2026-01-01'),
        new Date('2026-02-01')
      )
    ).not.toThrow()

  })

  it('debe aceptar cuando inicio y fin son el mismo día', () => {

    expect(() =>
      validarFechas(
        new Date('2026-01-01'),
        new Date('2026-01-01')
      )
    ).not.toThrow()

  })

  it('debe rechazar una fecha de inicio inválida', () => {

    expect(() =>
      validarFechas(
        new Date('fecha-invalida'),
        null
      )
    ).toThrow('La fecha de inicio es inválida')

  })

  it('debe rechazar una fecha de fin inválida', () => {

    expect(() =>
      validarFechas(
        new Date('2026-01-01'),
        new Date('fecha-invalida')
      )
    ).toThrow('La fecha de fin es inválida')

  })

  it('debe rechazar cuando la fecha de fin es anterior a la de inicio', () => {

    expect(() =>
      validarFechas(
        new Date('2026-02-01'),
        new Date('2026-01-01')
      )
    ).toThrow(
      'La fecha de inicio debe ser anterior o igual a la fecha de fin'
    )

  })

})