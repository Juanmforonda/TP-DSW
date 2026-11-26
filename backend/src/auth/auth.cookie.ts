import type { CookieOptions, Request, Response } from 'express';

export const AUTH_COOKIE_NAME = 'auth_token';

function getSameSite() {
  const value = (process.env.AUTH_COOKIE_SAME_SITE ?? 'lax').toLowerCase();
  if (value === 'strict' || value === 'lax' || value === 'none') return value;
  throw new Error('AUTH_COOKIE_SAME_SITE debe ser strict, lax o none');
}

const sameSite = getSameSite();
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
  sameSite,
  path: '/',
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
}

export function getAuthToken(req: Request) {
  const cookies = req.headers.cookie?.split(';') ?? [];
  for (const cookie of cookies) {
    const separator = cookie.indexOf('=');
    if (separator < 0) continue;

    const name = cookie.slice(0, separator).trim();
    if (name === AUTH_COOKIE_NAME) return cookie.slice(separator + 1).trim();
  }

  return '';
}
