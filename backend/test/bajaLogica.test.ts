import { beforeEach, describe, expect, it, vi } from 'vitest';
import { procesarBajaLogicaSocio } from '../src/socio/socio.rules.js';
import { EstadoReservaInfraestructura } from '../src/reservaInfraestructura/reservaInfraestructura.entity.js';
import { Estado as EstadoAmarra } from '../src/amarra/amarra.entity.js';
import { Estado as EstadoBox } from '../src/box/box.entity.js';
import { EstadoReservaTravelLift } from '../src/reservaTravelLift/reservaTravelLift.entity.js';

// Mock del ORM para el test del controlador
vi.mock('../src/shared/orm.js', () => ({
  orm: {
    em: {
      transactional: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      flush: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

import { orm } from '../src/shared/orm.js';
import { bajaLogica } from '../src/socio/socio.controler.js';
import { Socio } from '../src/socio/socio.entity.js';
import { Afiliacion } from '../src/afiliacion/afiliacion.entity.js';
import { Embarcacion } from '../src/embarcacion/embarcacion.entity.js';
import { ReservaInfraestructura } from '../src/reservaInfraestructura/reservaInfraestructura.entity.js';
import { CuotaMensual } from '../src/cuotaMensual/cuotaMensual.entity.js';
import { DetalleCuota } from '../src/detalleCuota/detalleCuota.entity.js';

describe('Baja lógica de socio y preservación de historial', () => {
  describe('Reglas de negocio (procesarBajaLogicaSocio)', () => {
    it('debe marcar embarcaciones como inactivas y cerrar reservas activas sin eliminar reservas ni cuotas históricas', () => {
      const fechaBaja = new Date('2026-11-17T12:00:00Z');
      const fechaInicioHistorica = new Date('2025-01-01T00:00:00Z');
      const fechaFinHistorica = new Date('2025-06-01T00:00:00Z');

      const afiliacionActiva = { fechaFin: null };

      const embarcacion1 = {
        id: 10,
        nombre: 'El Navegante',
        fechaFin: undefined as Date | undefined,
      };
      const embarcacion2 = {
        id: 11,
        nombre: 'El Rayo',
        fechaFin: new Date('2024-05-10T00:00:00Z'), // ya dada de baja previamente
      };

      const embarcaciones = [embarcacion1, embarcacion2];

      const amarraActiva = { id: 1, estado: EstadoAmarra.OCUPADO };
      const boxActivo = { id: 2, estado: EstadoBox.OCUPADO };

      const reservaActivaAmarra = {
        id: 101,
        estado: EstadoReservaInfraestructura.ACTIVA,
        fechaInicio: new Date('2026-01-01T00:00:00Z'),
        fechaFin: null,
        amarra: amarraActiva,
        box: null,
        embarcacion: embarcacion1,
      };

      const reservaActivaBox = {
        id: 102,
        estado: EstadoReservaInfraestructura.ACTIVA,
        fechaInicio: new Date('2026-02-01T00:00:00Z'),
        fechaFin: null,
        amarra: null,
        box: boxActivo,
        embarcacion: embarcacion1,
      };

      // Reserva histórica ya finalizada en el pasado
      const reservaHistorica = {
        id: 99,
        estado: EstadoReservaInfraestructura.FINALIZADA,
        fechaInicio: fechaInicioHistorica,
        fechaFin: fechaFinHistorica,
        amarra: { id: 3, estado: EstadoAmarra.LIBRE },
        box: null,
        embarcacion: embarcacion1,
      };

      const reservasInfra = [reservaActivaAmarra, reservaActivaBox, reservaHistorica];

      // Cuotas históricas vinculadas a la reserva histórica y a la activa
      const cuotaHistorica = {
        id: 501,
        mes: 3,
        anio: 2025,
        monto: 15000,
        pagada: true,
        detalles: [
          {
            id: 801,
            concepto: 'Amarra Nro 3',
            monto: 10000,
            reservaInfraestructura: reservaHistorica,
          },
        ],
      };

      procesarBajaLogicaSocio(
        {
          afiliacionActiva,
          embarcaciones,
          reservasInfraestructura: reservasInfra,
        },
        fechaBaja
      );

      // 1. Afiliación cerrada con la fecha de baja
      expect(afiliacionActiva.fechaFin).toEqual(fechaBaja);

      // 2. Embarcación activa pasa a tener fechaFin; la que ya tenía fechaFin no se sobreescribe
      expect(embarcacion1.fechaFin).toEqual(fechaBaja);
      expect(embarcacion2.fechaFin).toEqual(new Date('2024-05-10T00:00:00Z'));
      // Ambas embarcaciones siguen existiendo en el array
      expect(embarcaciones).toHaveLength(2);

      // 3. Reservas activas pasan a CANCELADA y liberan sus recursos
      expect(reservaActivaAmarra.estado).toBe(EstadoReservaInfraestructura.CANCELADA);
      expect(reservaActivaAmarra.fechaFin).toEqual(fechaBaja);
      expect(amarraActiva.estado).toBe(EstadoAmarra.LIBRE);

      expect(reservaActivaBox.estado).toBe(EstadoReservaInfraestructura.CANCELADA);
      expect(reservaActivaBox.fechaFin).toEqual(fechaBaja);
      expect(boxActivo.estado).toBe(EstadoBox.DISPONIBLE);

      // 4. HISTORIAL CONSERVADO: la reserva histórica y la cuota histórica no fueron eliminadas ni alteradas
      expect(reservasInfra).toHaveLength(3);
      expect(reservaHistorica.estado).toBe(EstadoReservaInfraestructura.FINALIZADA);
      expect(reservaHistorica.fechaInicio).toEqual(fechaInicioHistorica);
      expect(reservaHistorica.fechaFin).toEqual(fechaFinHistorica);

      // La cuota histórica sigue referenciando a su reserva original intacta
      expect(cuotaHistorica.detalles[0].reservaInfraestructura.id).toBe(99);
      expect(cuotaHistorica.detalles[0].monto).toBe(10000);
      expect(cuotaHistorica.pagada).toBe(true);
    });

    it('no debe liberar una amarra o box si se encuentra en estado de mantenimiento', () => {
      const amarraMantenimiento = { id: 5, estado: EstadoAmarra.MANTENIMIENTO };
      const reserva = {
        estado: EstadoReservaInfraestructura.ACTIVA,
        fechaFin: null,
        amarra: amarraMantenimiento,
        box: null,
      };

      procesarBajaLogicaSocio({
        afiliacionActiva: { fechaFin: null },
        embarcaciones: [],
        reservasInfraestructura: [reserva],
      });

      expect(reserva.estado).toBe(EstadoReservaInfraestructura.CANCELADA);
      expect(amarraMantenimiento.estado).toBe(EstadoAmarra.MANTENIMIENTO);
    });
  });

  describe('Controlador bajaLogica (integración transaccional)', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('debe ejecutar la baja lógica persistiendo cambios sin llamar a em.remove en embarcaciones ni reservas', async () => {
      const mockSocio = { id: 1, nombre: 'Carlos', apellido: 'Gómez' };
      const mockAfiliacion = { id: 1, socio: 1, fechaFin: null };
      const mockEmbarcacion = { id: 10, nombre: 'Poseidón', socio: 1, fechaFin: undefined };
      const mockReserva = {
        id: 20,
        estado: EstadoReservaInfraestructura.ACTIVA,
        embarcacion: mockEmbarcacion,
        amarra: { id: 1, estado: EstadoAmarra.OCUPADO },
        box: null,
        fechaFin: null,
      };

      const removeSpy = vi.fn();
      const flushSpy = vi.fn();

      const emMock = {
        findOne: vi.fn((entity, filter) => {
          if (entity === Socio) return Promise.resolve(mockSocio);
          if (entity === Afiliacion) return Promise.resolve(mockAfiliacion);
          return Promise.resolve(null);
        }),
        find: vi.fn((entity, filter) => {
          if (entity === Embarcacion) return Promise.resolve([mockEmbarcacion]);
          if (entity === ReservaInfraestructura) return Promise.resolve([mockReserva]);
          return Promise.resolve([]);
        }),
        remove: removeSpy,
        flush: flushSpy,
      };

      vi.mocked(orm.em.transactional).mockImplementation(async (callback: any) => {
        return callback(emMock);
      });

      const req: any = { params: { id: '1' } };
      let jsonResponse: any = null;
      let statusCode: number = 0;
      const res: any = {
        status: vi.fn((code: number) => {
          statusCode = code;
          return {
            json: vi.fn((data: any) => {
              jsonResponse = data;
            }),
          };
        }),
      };

      await bajaLogica(req, res);

      // Verificaciones:
      expect(statusCode).toBe(200);
      expect(jsonResponse.message).toBe('Baja lógica realizada correctamente');

      // CRÍTICO: nunca se debe llamar a remove() para embarcaciones ni reservas
      expect(removeSpy).not.toHaveBeenCalled();

      // Se debe haber invocado a flush para guardar el estado
      expect(flushSpy).toHaveBeenCalledTimes(1);

      // Los datos deben estar marcados con baja lógica
      expect(mockAfiliacion.fechaFin).toBeInstanceOf(Date);
      expect(mockEmbarcacion.fechaFin).toBeInstanceOf(Date);
      expect(mockReserva.estado).toBe(EstadoReservaInfraestructura.CANCELADA);
      expect(mockReserva.amarra.estado).toBe(EstadoAmarra.LIBRE);
    });

    it('debe devolver 404 si el socio no existe', async () => {
      const emMock = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      vi.mocked(orm.em.transactional).mockImplementation(async (callback: any) => {
        return callback(emMock);
      });

      const req: any = { params: { id: '999' } };
      let jsonResponse: any = null;
      let statusCode: number = 0;
      const res: any = {
        status: vi.fn((code: number) => {
          statusCode = code;
          return {
            json: vi.fn((data: any) => {
              jsonResponse = data;
            }),
          };
        }),
      };

      await bajaLogica(req, res);

      expect(statusCode).toBe(404);
      expect(jsonResponse.message).toBe('Socio no encontrado');
    });

    it('debe devolver 400 si el socio no tiene afiliación activa', async () => {
      const mockSocio = { id: 1, nombre: 'Carlos' };
      const emMock = {
        findOne: vi.fn((entity) => {
          if (entity === Socio) return Promise.resolve(mockSocio);
          if (entity === Afiliacion) return Promise.resolve(null);
          return Promise.resolve(null);
        }),
      };

      vi.mocked(orm.em.transactional).mockImplementation(async (callback: any) => {
        return callback(emMock);
      });

      const req: any = { params: { id: '1' } };
      let jsonResponse: any = null;
      let statusCode: number = 0;
      const res: any = {
        status: vi.fn((code: number) => {
          statusCode = code;
          return {
            json: vi.fn((data: any) => {
              jsonResponse = data;
            }),
          };
        }),
      };

      await bajaLogica(req, res);

      expect(statusCode).toBe(400);
      expect(jsonResponse.message).toBe('El socio no tiene una afiliación activa');
    });
  });
});
