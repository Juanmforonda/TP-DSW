import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import ListaEmbarcacionesClub from '../src/components/ListaEmbarcacionesClub'

describe('ListaEmbarcacionesClub', () => {

  it('debe mostrar embarcaciones y permitir seleccionar una', () => {

    const onSelect = vi.fn()

    const embarcaciones = [
      {
        id: 1,
        nombre: 'Titanic',
        tipo: 'Velero',
        eslora: 12,
      },
      {
        id: 2,
        nombre: 'Poseidon',
        tipo: 'Lancha',
        eslora: 8,
      },
    ]

    render(
      <ListaEmbarcacionesClub
        embarcaciones={embarcaciones}
        selectedId={null}
        onSelect={onSelect}
      />
    )

    expect(
      screen.getByText('Titanic')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Poseidon')
    ).toBeInTheDocument()

    const botones =
      screen.getAllByText('Seleccionar')

    expect(botones).toHaveLength(2)

    fireEvent.click(botones[0])

    expect(onSelect).toHaveBeenCalledWith(1)

  })

})