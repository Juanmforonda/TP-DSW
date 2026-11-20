// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearSession,
  getUserTestimonials,
  saveUserTestimonials,
  readJSON,
} from './storage.js';

function crearStorageFalso() {
  let datos = {};
  return {
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => { datos[k] = String(v); },
    removeItem: (k) => { delete datos[k]; },
    clear: () => { datos = {}; },
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', crearStorageFalso());
});

describe('storage', () => {
  it('JSON corrupto devuelve el valor por defecto sin lanzar', () => {
    localStorage.setItem('userTestimonials', '{no es json');
    expect(getUserTestimonials()).toEqual([]);
    expect(readJSON('userTestimonials', 'x')).toBe('x');
  });

  it('formato inesperado devuelve lista vacía', () => {
    localStorage.setItem('userTestimonials', JSON.stringify({ cualquier: 'cosa' }));
    expect(getUserTestimonials()).toEqual([]);
  });

  it('descarta elementos que no son objetos', () => {
    localStorage.setItem('userTestimonials', JSON.stringify([{ name: 'Ana' }, 5, null, 'x']));
    expect(getUserTestimonials()).toEqual([{ name: 'Ana' }]);
  });

  it('acepta el formato anterior (array directo)', () => {
    localStorage.setItem('userTestimonials', JSON.stringify([{ name: 'Ana' }]));
    expect(getUserTestimonials()).toEqual([{ name: 'Ana' }]);
  });

  it('guarda con versión y lo recupera', () => {
    saveUserTestimonials([{ name: 'Luis' }]);
    expect(JSON.parse(localStorage.getItem('userTestimonials')).v).toBe(1);
    expect(getUserTestimonials()).toEqual([{ name: 'Luis' }]);
  });

  it('clearSession borra la sesión pero conserva los testimonios', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('socio', '{"id":100}');
    localStorage.setItem('tipo', 'socio');
    saveUserTestimonials([{ name: 'Luis' }]);

    clearSession();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('socio')).toBeNull();
    expect(localStorage.getItem('tipo')).toBeNull();
    expect(getUserTestimonials()).toEqual([{ name: 'Luis' }]);
  });
});