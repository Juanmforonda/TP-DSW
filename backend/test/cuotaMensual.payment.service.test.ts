import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  findOneOrFail: vi.fn(),
  transactional: vi.fn(),
  create: vi.fn(),
  persist: vi.fn(),
  getPayment: vi.fn(),
}));

vi.mock('../src/shared/orm.js', () => ({
  orm: {
    em: {
      findOne: mocks.findOne,
      findOneOrFail: mocks.findOneOrFail,
      transactional: mocks.transactional,
    },
  },
}));

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: class {},
  Payment: class {
    get = mocks.getPayment;
  },
}));

import {
  MercadoPagoValidationError,
  validateAndApplyMercadoPago,
} from '../src/cuotaMensual/cuotaMensual.payment.service.js';
import { CuotaMensual } from '../src/cuotaMensual/cuotaMensual.entity.js';

describe('Servicio de pagos de cuotas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transactional.mockImplementation(async (callback) =>
      callback({
        findOne: mocks.findOne,
        findOneOrFail: mocks.findOneOrFail,
        create: mocks.create,
        persist: mocks.persist,
      }),
    );
  });

  function prepareCuota() {
    return Object.assign(new CuotaMensual(), {
      id: 12,
      monto: 1500,
      pagada: false,
      socio: { id: 7 },
    });
  }

  it('aplica un pago aprobado con importe y moneda correctos', async () => {
    const cuota = prepareCuota();
    const pago = {
      id: 99,
      status: 'approved',
      currency_id: 'ARS',
      transaction_amount: 1500,
      external_reference: '12',
    };
    const auditoria = {};

    mocks.getPayment.mockResolvedValue(pago);
    mocks.findOne
      .mockResolvedValueOnce(cuota)
      .mockResolvedValueOnce(null);
    mocks.findOneOrFail.mockResolvedValue(cuota);
    mocks.create.mockReturnValue(auditoria);

    const result = await validateAndApplyMercadoPago('99');

    expect(result.applied).toBe(true);
    expect(cuota.pagada).toBe(true);
    expect(cuota.mercadoPagoPaymentId).toBe('99');
    expect(mocks.persist).toHaveBeenCalledWith(auditoria);
  });

  it('rechaza un importe distinto al de la cuota', async () => {
    const cuota = prepareCuota();
    mocks.getPayment.mockResolvedValue({
      id: 99,
      status: 'approved',
      currency_id: 'ARS',
      transaction_amount: 1499,
      external_reference: '12',
    });
    mocks.findOne.mockResolvedValue(cuota);

    await expect(validateAndApplyMercadoPago('99')).rejects.toEqual(
      expect.objectContaining({
        name: 'MercadoPagoValidationError',
        message: 'Importe de pago inválido',
      } satisfies Partial<MercadoPagoValidationError>),
    );
    expect(mocks.transactional).not.toHaveBeenCalled();
  });

  it('no permite consultar un pago asociado a la cuota de otro socio', async () => {
    const cuota = prepareCuota();
    mocks.getPayment.mockResolvedValue({
      id: 99,
      status: 'pending',
      external_reference: '12',
    });
    mocks.findOne.mockResolvedValue(cuota);

    await expect(
      validateAndApplyMercadoPago('99', 8),
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'MercadoPagoValidationError',
        statusCode: 404,
        message: 'Pago no encontrado',
      } satisfies Partial<MercadoPagoValidationError>),
    );
    expect(mocks.transactional).not.toHaveBeenCalled();
  });
});
