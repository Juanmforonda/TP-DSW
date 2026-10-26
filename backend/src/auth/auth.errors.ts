export class ValidationError extends Error {
  constructor(message = 'Email y contraseña inválidos') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  constructor(message = 'Credenciales inválidas') {
    super(message);
    this.name = 'AuthError';
  }
}
