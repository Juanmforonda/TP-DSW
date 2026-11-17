export function validarFortalezaPassword(pass: unknown): string | null {
  if (typeof pass !== 'string' || pass.length < 8) {
    return 'La nueva contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) {
    return 'La nueva contraseña debe incluir letras y números';
  }
  return null;
}