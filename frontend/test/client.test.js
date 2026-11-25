import { beforeEach, describe, expect, it } from 'vitest';
import api from '../src/api/client.js';

describe('Cliente HTTP', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('conserva la sesión cuando el servidor responde 403', async () => {
    localStorage.setItem('token', 'token-valido');
    const reject = api.interceptors.response.handlers[0].rejected;
    const error = { response: { status: 403 } };

    await expect(reject(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('token-valido');
  });
});
