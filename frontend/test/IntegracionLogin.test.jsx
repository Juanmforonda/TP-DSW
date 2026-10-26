import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import LoginForm from '../src/components/LoginForm'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login integración', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debe iniciar sesión como socio', async () => {

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'token-prueba',
            tipo: 'socio',
            socio: {
              id: 1,
              nombre: 'Juan'
            }
          })
      })
    )

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    )

    fireEvent.change(
      screen.getByPlaceholderText('Email'),
      {
        target: {
          value: 'test@test.com'
        }
      }
    )

    fireEvent.change(
      screen.getByPlaceholderText('Contraseña'),
      {
        target: {
          value: '123456'
        }
      }
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Entrar'
      })
    )

    await waitFor(() => {

      expect(
        localStorage.getItem('token')
      ).toBe('token-prueba')

      expect(
        localStorage.getItem('tipo')
      ).toBe('socio')

    })

  })

})