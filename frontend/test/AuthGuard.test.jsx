import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '../src/components/AuthGuard';

vi.mock('../src/api/auth', () => ({
  getAuthenticatedProfile: vi.fn(),
}));

import { getAuthenticatedProfile } from '../src/api/auth';

describe('AuthGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('permite el acceso cuando el backend devuelve el rol esperado', async () => {
    localStorage.setItem('token', 'token-valido');
    getAuthenticatedProfile.mockResolvedValue({
      data: { data: { tipo: 'socio', perfil: { id: 7 } } },
    });

    render(
      <MemoryRouter initialEntries={['/socio']}>
        <Routes>
          <Route element={<AuthGuard role="socio" />}>
            <Route path="/socio" element={<div>Panel socio</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Panel socio')).toBeInTheDocument();
    });
  });

  it('rechaza el acceso si el rol recibido no coincide', async () => {
    localStorage.setItem('token', 'token-valido');
    localStorage.setItem('tipo', 'socio');
    getAuthenticatedProfile.mockResolvedValue({
      data: { data: { tipo: 'admin', perfil: { id: 2 } } },
    });

    render(
      <MemoryRouter initialEntries={['/socio']}>
        <Routes>
          <Route element={<AuthGuard role="socio" />}>
            <Route path="/socio" element={<div>Panel socio</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
    expect(localStorage.getItem('token')).toBeNull();
  });
});
