const configuredSecret = process.env.JWT_SECRET;

if (!configuredSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET debe estar configurado en producción');
}

export const JWT_SECRET = configuredSecret ?? 'dev-only-secret-change-me';
