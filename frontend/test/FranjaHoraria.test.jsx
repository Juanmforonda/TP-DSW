import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import TimeSlotPicker from '../src/components/franjaHoraria.jsx'

describe('TimeSlotPicker', () => {

  it('debe mostrar franjas horarias para una fecha seleccionada', () => {

    render(
      <TimeSlotPicker
        dateLocal="2026-01-15"
        reservas={[]}
      />
    )

    expect(
      screen.getByText('07:00')
    ).toBeInTheDocument()

    expect(
      screen.getByText('07:30')
    ).toBeInTheDocument()

    expect(
      screen.getByText('08:00')
    ).toBeInTheDocument()

  })

})