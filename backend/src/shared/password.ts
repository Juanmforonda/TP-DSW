export function validarFortalezaPassword(pass: unknown): string | null {
  if (typeof pass !== 'string') {
    return 'La contraseña debe ser una cadena de texto válida';
  }

  if (pass.trim().length < 6) {
    return 'La nueva contraseña debe tener al menos 6 caracteres';
  }

  if (pass.length > 64) {
    return 'La nueva contraseña no puede superar los 64 caracteres';
  }

  return null;
}
