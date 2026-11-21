import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SocioReservasEmbarcacion }
from '../src/pages/socio/SocioReservasEmbarcacion'

vi.mock(
  '../src/api/embarcaciones.js',
  () => ({
    getEmbarcacionesClub: vi.fn(() =>
      Promise.resolve({
        data: {
          data: []
        }
      })
    )
  })
)

vi.mock(
  '../src/api/reservasEmbarcacionClub.js',
  () => ({
    getMisReservasEmbarcacionClub: vi.fn(() =>
      Promise.resolve({
        data: {
          data: [
            {
              id: 1,
              estado: 'ACTIVA',
              fechaInicio: '2026-01-15T10:00:00.000Z',
              fechaFin: '2026-01-15T11:00:00.000Z',
              embarcacion: {
                nombre: 'Titanic'
              }
            }
          ]
        }
      })
    ),

    getReservasPorEmbarcacion: vi.fn(() =>
      Promise.resolve({
        data: {
          data: []
        }
      })
    ),

    actualizarReservaEmbarcacionClub: vi.fn(() =>
      Promise.resolve({
        data: {
          message: 'ok'
        }
      })
    ),

    crearReservaEmbarcacionClub: vi.fn(),
    cancelarReservaEmbarcacionClub: vi.fn(),
    finalizarReservaEmbarcacionClub: vi.fn(),
  })
)

vi.mock(
  '../src/components/FranjaHoraria.jsx',
  () => ({
    default: () => <div>TimeSlotPicker Mock</div>
  })
)

vi.mock(
  '../src/components/ListaEmbarcacionesClub.jsx',
  () => ({
    default: ({ onSelect }) => (
      <button onClick={() => onSelect(1)}>
        Seleccionar
      </button>
    )
  })
)

describe(
  'SocioReservasEmbarcacion',
  () => {

    it(
      'debe cerrar el modal luego de editar una reserva',
      async () => {

        const user = userEvent.setup();

        render(
          <SocioReservasEmbarcacion
            idSocio={1}
          />
        );

        const botonSeleccionar =
          screen.getByText('Seleccionar');

        await user.click(
          botonSeleccionar
        );
        
        const botonEditar =
          await screen.findByText(
            'Editar'
          );

        await user.click(
          botonEditar
        );

        expect(
          screen.getByText(
            'Editar reserva'
          )
        ).toBeInTheDocument();

        const botonGuardar =
          screen.getByText(
            'Guardar'
          );

        await user.click(
          botonGuardar
        );

        await waitFor(() => {

          expect(
            screen.queryByText(
              'Editar reserva'
            )
          ).not.toBeInTheDocument();

        });

      }
    );
  }
);