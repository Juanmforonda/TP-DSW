const isProduction = process.env.NODE_ENV === 'production';

const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const configuredOrigins = process.env.ALLOWED_ORIGINS;

if (isProduction && !configuredOrigins?.trim()) {
  throw new Error('ALLOWED_ORIGINS es obligatorio en producción');
}

export const allowedOrigins = (configuredOrigins ?? defaultOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (
  isProduction &&
  allowedOrigins.some((origin) => {
    const hostname = new URL(origin).hostname;

    return hostname === 'localhost' || hostname === '127.0.0.1';
  })
) {
  throw new Error('ALLOWED_ORIGINS no puede contener localhost en producción');
}

export function isAllowedOrigin(origin: string | undefined) {
  return Boolean(origin && allowedOrigins.includes(origin));
}
