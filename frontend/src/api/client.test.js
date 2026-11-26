// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

describe('cliente API con autenticación por cookie', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
    vi.stubGlobal('window', {
      location: {
        pathname: '/admin',
        replace: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envía credenciales y conserva la sesión ante un 403', async () => {
    localStorage.setItem('token', 'legacy-token');
    let requestConfig;
    const adapter = vi.fn((config) => {
      requestConfig = config;
      return Promise.reject({ response: { status: 403 } });
    });

    await api.get('/private', { adapter }).catch(() => undefined);

    expect(requestConfig.withCredentials).toBe(true);
    expect(requestConfig.headers.Authorization).toBeUndefined();
    expect(localStorage.getItem('token')).toBe('legacy-token');
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('limpia la sesión y redirige una sola vez ante un 401', async () => {
    localStorage.setItem('token', 'legacy-token');
    localStorage.setItem('socio', '{"id":42}');
    const adapter = vi.fn(() =>
      Promise.reject({ response: { status: 401 } }),
    );

    await Promise.all([
      api.get('/private-a', { adapter }).catch(() => undefined),
      api.get('/private-b', { adapter }).catch(() => undefined),
    ]);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('socio')).toBeNull();
    expect(window.location.replace).toHaveBeenCalledOnce();
    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });
});
