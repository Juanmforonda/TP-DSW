import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';

const em = vi.hoisted(() => ({
  find: vi.fn(),
  findOneOrFail: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('../src/shared/orm.js', () => ({ orm: { em } }));

import {
  finalizar as finalizarReservaClub,
  getDisponibilidadPorEmbarcacion,
} from '../src/reservaEmbarcacionClub/reservaEmbarcacionClub.controller.js';
import {
  finalizar as finalizarReservaTravelLift,
  findAvailability,
} from '../src/reservaTravelLift/reservaTravelLift.controller.js';

function makeResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

function makeRequest(tipo: 'admin' | 'socio', userId: number, id = '1') {
  return {
    params: { id, idEmbarcacion: '3' },
    user: { id: userId, tipo },
  };
}

describe('Autorización de reservas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('solo permite al socio finalizar una reserva propia del club', async () => {
    const reserva = { socio: { id: 8 }, estado: 'ACTIVA' };
    em.findOneOrFail.mockResolvedValue(reserva);
    const res = makeResponse();

    await finalizarReservaClub(makeRequest('socio', 7) as never, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(em.flush).not.toHaveBeenCalled();
  });

  it('permite al socio dueño y al administrador finalizar reservas del club', async () => {
    const reserva = { socio: { id: 7 }, estado: 'ACTIVA' };
    em.findOneOrFail.mockResolvedValue(reserva);
    const socioResponse = makeResponse();

    await finalizarReservaClub(makeRequest('socio', 7) as never, socioResponse);

    expect(socioResponse.status).toHaveBeenCalledWith(200);
    expect(em.flush).toHaveBeenCalledOnce();

    em.findOneOrFail.mockResolvedValue({ socio: { id: 8 }, estado: 'ACTIVA' });
    const adminResponse = makeResponse();

    await finalizarReservaClub(makeRequest('admin', 2) as never, adminResponse);

    expect(adminResponse.status).toHaveBeenCalledWith(200);
    expect(em.flush).toHaveBeenCalledTimes(2);
  });

  it('solo permite al socio finalizar una reserva propia de Travel Lift', async () => {
    em.findOneOrFail.mockResolvedValue({
      socio: { id: 8 },
      estado: 'ACTIVA',
    });
    const res = makeResponse();

    await finalizarReservaTravelLift(makeRequest('socio', 7) as never, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(em.flush).not.toHaveBeenCalled();

    em.findOneOrFail.mockResolvedValue({
      socio: { id: 7 },
      estado: 'ACTIVA',
    });
    const ownerResponse = makeResponse();

    await finalizarReservaTravelLift(makeRequest('socio', 7) as never, ownerResponse);

    expect(ownerResponse.status).toHaveBeenCalledWith(200);
    expect(em.flush).toHaveBeenCalledOnce();

    em.findOneOrFail.mockResolvedValue({
      socio: { id: 8 },
      estado: 'ACTIVA',
    });
    const adminResponse = makeResponse();

    await finalizarReservaTravelLift(makeRequest('admin', 2) as never, adminResponse);

    expect(adminResponse.status).toHaveBeenCalledWith(200);
    expect(em.flush).toHaveBeenCalledTimes(2);
  });

  it('expone disponibilidad sin incluir relaciones personales', async () => {
    em.find.mockResolvedValue([
      {
        id: 1,
        fechaInicio: new Date('2026-04-01T10:00:00Z'),
        fechaFin: new Date('2026-04-01T11:00:00Z'),
        estado: 'ACTIVA',
        socio: { nombre: 'Información privada' },
      },
    ]);
    const resClub = makeResponse();

    await getDisponibilidadPorEmbarcacion(
      makeRequest('socio', 7) as never,
      resClub,
    );

    expect(resClub.json).toHaveBeenCalledWith({
      message: 'Disponibilidad de la embarcación encontrada',
      data: [
        {
          id: 1,
          fechaInicio: new Date('2026-04-01T10:00:00Z'),
          fechaFin: new Date('2026-04-01T11:00:00Z'),
          estado: 'ACTIVA',
        },
      ],
    });

    em.find.mockResolvedValue([
      {
        id: 2,
        fechaHoraInicio: new Date('2026-04-01T12:00:00Z'),
        fechaHoraFin: new Date('2026-04-01T13:00:00Z'),
        socio: { nombre: 'Información privada' },
      },
    ]);
    const resTravelLift = makeResponse();

    await findAvailability(makeRequest('socio', 7) as never, resTravelLift);

    expect(resTravelLift.json).toHaveBeenCalledWith({
      message: 'Disponibilidad del Travel Lift encontrada',
      data: [
        {
          id: 2,
          fechaHoraInicio: new Date('2026-04-01T12:00:00Z'),
          fechaHoraFin: new Date('2026-04-01T13:00:00Z'),
          estado: 'ACTIVA',
        },
      ],
    });
  });
});
