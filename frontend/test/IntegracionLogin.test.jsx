import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '../src/components/LoginForm'
import { loginUser } from '../src/api/auth.js';

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})


vi.mock('../src/api/auth.js', () => ({
  loginUser: vi.fn(),
}));


describe('Login integración', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debe iniciar sesión como socio', async () => {

    loginUser.mockResolvedValue({
      data: {
        token: 'token-prueba',
        tipo: 'socio',
      },
    });


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

      expect(localStorage.getItem('tipo')).toBeNull()
      expect(localStorage.getItem('socio')).toBeNull()

    })

  })

})