import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/api/cuotas.js', () => ({
  consultarEstadoPagoMP: vi.fn(),
}));

import { consultarEstadoPagoMP } from '../src/api/cuotas.js';
import { PagoResultado } from '../src/pages/PagoResultado.jsx';

describe('PagoResultado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa el estado verificado por backend en vez del estado de la URL', async () => {
    consultarEstadoPagoMP.mockResolvedValue({
      data: { data: { estado: 'approved' } },
    });

    render(
      <MemoryRouter
        initialEntries={['/pago/error?payment_id=99&status=rejected']}
      >
        <PagoResultado />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Pago aprobado')).toBeInTheDocument();
    expect(consultarEstadoPagoMP).toHaveBeenCalledWith('99');
    expect(screen.queryByText('Pago no aprobado')).not.toBeInTheDocument();
  });

  it('muestra un estado no verificable si falta el identificador de pago', async () => {
    render(
      <MemoryRouter initialEntries={['/pago/exito']}>
        <PagoResultado />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('No pudimos verificar el pago'),
    ).toBeInTheDocument();
    expect(consultarEstadoPagoMP).not.toHaveBeenCalled();
  });
});
