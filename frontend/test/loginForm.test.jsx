import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import LoginForm from '../src/components/LoginForm'

describe('LoginForm', () => {

  it('debe renderizar los elementos principales del formulario', () => {

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    )

    expect(
      screen.getByText('Iniciar Sesión')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Email')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Contraseña')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Entrar' })
    ).toBeInTheDocument()

  })

})