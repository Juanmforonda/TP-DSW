import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EntityTable } from '../src/components/TablaGenerica'

describe('EntityTable', () => {

  it('debe mostrar columnas y datos recibidos', () => {

    const columns = [
      {
        key: 'nombre',
        label: 'Nombre',
      },
      {
        key: 'matricula',
        label: 'Matrícula',
      },
    ]

    const data = [
      {
        id: 1,
        nombre: 'Titanic',
        matricula: 'ABC123',
      },
      {
        id: 2,
        nombre: 'Poseidon',
        matricula: 'XYZ789',
      },
    ]

    render(
      <EntityTable
        columns={columns}
        data={data}
        entityName="embarcacion"
      />
    )

    expect(
      screen.getByText('Nombre')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Matrícula')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Titanic')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Poseidon')
    ).toBeInTheDocument()

    expect(
      screen.getByText('ABC123')
    ).toBeInTheDocument()

    expect(
      screen.getByText('XYZ789')
    ).toBeInTheDocument()

  })

})