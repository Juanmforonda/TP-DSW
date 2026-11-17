import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del cliente Axios central
vi.mock('../src/api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../src/api/client.js';
import * as tiposEmbarcacionApi from '../src/api/tiposEmbarcacion.js';
import * as embarcacionesApi from '../src/api/embarcaciones.js';
import * as sociosApi from '../src/api/socios.js';
import * as administradoresApi from '../src/api/administradores.js';
import * as afiliacionesApi from '../src/api/afiliaciones.js';
import * as amarrasApi from '../src/api/amarras.js';
import * as boxesApi from '../src/api/boxes.js';
import * as cuotasApi from '../src/api/cuotas.js';
import * as reservasEmbarcacionClubApi from '../src/api/reservasEmbarcacionClub.js';
import * as reservasInfraestructuraApi from '../src/api/reservasInfraestructura.js';
import * as reservasTravelLiftApi from '../src/api/reservasTravelLift.js';

describe('Prueba de contrato de módulos API vs Rutas de Backend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tiposEmbarcacion.js', () => {
    it('NO debe exportar la función inexistente getTipoEmbarcacionPorSocio', () => {
      expect(tiposEmbarcacionApi).not.toHaveProperty('getTipoEmbarcacionPorSocio');
    });

    it('debe alinearse con las rutas reales expuestas por tipoEmbarcacion.routes.ts', () => {
      tiposEmbarcacionApi.getTiposEmbarcacion();
      expect(api.get).toHaveBeenCalledWith('/api/tiposEmbarcacion');

      tiposEmbarcacionApi.crearTipoEmbarcacion({ nombre: 'Velero' });
      expect(api.post).toHaveBeenCalledWith('/api/tiposEmbarcacion', { nombre: 'Velero' });

      tiposEmbarcacionApi.actualizarTipoEmbarcacion(5, { nombre: 'Catamarán' });
      expect(api.put).toHaveBeenCalledWith('/api/tiposEmbarcacion/5', { nombre: 'Catamarán' });

      tiposEmbarcacionApi.eliminarTipoEmbarcacion(5);
      expect(api.delete).toHaveBeenCalledWith('/api/tiposEmbarcacion/5');
    });
  });

  describe('embarcaciones.js', () => {
    it('debe consultar embarcaciones por socio en /api/embarcaciones/socio/:id (ruta real)', () => {
      embarcacionesApi.getEmbarcacionesActivasPorSocio(42);
      expect(api.get).toHaveBeenCalledWith('/api/embarcaciones/socio/42');

      embarcacionesApi.getEmbarcacionesClub();
      expect(api.get).toHaveBeenCalledWith('/api/embarcaciones/club');

      embarcacionesApi.cambiarUbicacionEmbarcacion(1, { amarra: 2 });
      expect(api.post).toHaveBeenCalledWith('/api/embarcaciones/1/cambiar-ubicacion', { amarra: 2 });
    });
  });

  describe('socios.js y administradores.js', () => {
    it('deben usar rutas absolutas de API (/api/...) sin prefijos relativos ./api/...', () => {
      sociosApi.getSocios();
      expect(api.get).toHaveBeenCalledWith('/api/socios');

      sociosApi.bajaLogicaSocio(10);
      expect(api.put).toHaveBeenCalledWith('/api/socios/baja-logica/10');

      administradoresApi.getAdministradores();
      expect(api.get).toHaveBeenCalledWith('/api/administradores');
    });
  });

  describe('Validación global de endpoints de los módulos de API', () => {
    const modules = [
      { name: 'tiposEmbarcacion', mod: tiposEmbarcacionApi, base: '/api/tiposEmbarcacion' },
      { name: 'embarcaciones', mod: embarcacionesApi, base: '/api/embarcaciones' },
      { name: 'socios', mod: sociosApi, base: '/api/socios' },
      { name: 'administradores', mod: administradoresApi, base: '/api/administradores' },
      { name: 'afiliaciones', mod: afiliacionesApi, base: '/api/afiliaciones' },
      { name: 'amarras', mod: amarrasApi, base: '/api/amarras' },
      { name: 'boxes', mod: boxesApi, base: '/api/boxes' },
      { name: 'cuotas', mod: cuotasApi, base: '/api/cuotasMensuales' },
      { name: 'reservasEmbarcacionClub', mod: reservasEmbarcacionClubApi, base: '/api/reservasEmbarcacionClub' },
      { name: 'reservasInfraestructura', mod: reservasInfraestructuraApi, base: '/api/reservasInfraestructura' },
      { name: 'reservasTravelLift', mod: reservasTravelLiftApi, base: '/api/reservasTravelLift' },
    ];

    it('todos los módulos deben apuntar exclusivamente a rutas absolutas bajo /api/', () => {
      modules.forEach(({ name, mod, base }) => {
        expect(base.startsWith('/api/')).toBe(true);

        // Ningún módulo debe tener funciones que apunten a /socio/ bajo tiposEmbarcacion
        if (name === 'tiposEmbarcacion') {
          Object.keys(mod).forEach((fnName) => {
            expect(fnName).not.toMatch(/socio/i);
          });
        }
      });
    });
  });
});
