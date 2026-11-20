import { Payment } from 'mercadopago';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes.js';
import { orm } from '../shared/orm.js';
import { mpClient } from '../config/mercadopago.config.js';
import { CuotaMensual, MetodoPago } from './cuotaMensual.entity.js';
import {
  PagoAuditoria,
  PagoAuditoriaFuente,
} from './pagoAuditoria.entity.js';

const em = orm.em;

export class MercadoPagoValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = 'MercadoPagoValidationError';
  }
}

export type MercadoPagoPaymentResult = {
  payment: PaymentResponse;
  cuota: CuotaMensual;
  applied: boolean;
};

function parseCuotaId(externalReference: unknown) { 
  if (
    typeof externalReference !== 'string' ||
    !/^[1-9]\d*$/.test(externalReference)
  ) {
    throw new MercadoPagoValidationError('Referencia de cuota inválida');
  }

  return Number(externalReference);
}

function sameAmount(left: number, right: number) {
  return left.toFixed(2) === right.toFixed(2);
}

async function getPayment(paymentId: string) {
  if (!/^[1-9]\d*$/.test(paymentId)) {
    throw new MercadoPagoValidationError('Identificador de pago inválido');
  }

  const paymentClient = new Payment(mpClient);
  return paymentClient.get({ id: paymentId });
}

export async function validateAndApplyMercadoPago(
  paymentId: string,
): Promise<MercadoPagoPaymentResult> {
  const payment = await getPayment(paymentId);
  const cuotaId = parseCuotaId(payment.external_reference);
  const cuota = await em.findOne(
    CuotaMensual,
    { id: cuotaId },
    { populate: ['socio'] },
  );

  if (!cuota) {
    throw new MercadoPagoValidationError('Cuota no encontrada');
  }

  if (payment.status !== 'approved') {
    return { payment, cuota, applied: false };
  }

  if (payment.currency_id !== 'ARS') {
    throw new MercadoPagoValidationError('Moneda de pago inválida');
  }

  if (
    typeof payment.transaction_amount !== 'number' ||
    !Number.isFinite(payment.transaction_amount) ||
    !sameAmount(payment.transaction_amount, Number(cuota.monto))
  ) {
    throw new MercadoPagoValidationError('Importe de pago inválido');
  }

  const paymentIdFromProvider = String(payment.id ?? paymentId);
  const result = await em.transactional(async (transactionEm) => {
    const cuotaWithPayment = await transactionEm.findOne(CuotaMensual, {
      mercadoPagoPaymentId: paymentIdFromProvider,
    });

    if (cuotaWithPayment && cuotaWithPayment.id !== cuota.id) {
      throw new MercadoPagoValidationError(
        'El pago ya está asociado a otra cuota',
      );
    }

    const cuotaActual = await transactionEm.findOneOrFail(
      CuotaMensual,
      { id: cuota.id },
      { populate: ['socio'] },
    );

    if (cuotaActual.pagada) {
      if (cuotaActual.mercadoPagoPaymentId === paymentIdFromProvider) {
        return { cuota: cuotaActual, applied: false };
      }

      throw new MercadoPagoValidationError('La cuota ya fue pagada');
    }

    cuotaActual.pagada = true;
    cuotaActual.metodoPago = MetodoPago.MERCADO_PAGO;
    cuotaActual.fechaPago = new Date();
    cuotaActual.mercadoPagoPaymentId = paymentIdFromProvider;

    const auditoria = transactionEm.create(PagoAuditoria, {
      estadoAnterior: false,
      estadoNuevo: true,
      importe: Number(cuotaActual.monto),
      moneda: payment.currency_id ?? 'ARS',
      fuente: PagoAuditoriaFuente.MERCADO_PAGO,
      fecha: new Date(),
      paymentId: paymentIdFromProvider,
      cuota: cuotaActual,
    });
    transactionEm.persist(auditoria);

    return { cuota: cuotaActual, applied: true };
  });

  return { payment, cuota: result.cuota, applied: result.applied };
}

export async function registerManualCashPayment(
  cuotaId: number,
  administradorId: string | number,
  fechaPago: Date,
) {
  return em.transactional(async (transactionEm) => {
    const cuota = await transactionEm.findOneOrFail(CuotaMensual, {
      id: cuotaId,
    });

    if (cuota.pagada) {
      throw new MercadoPagoValidationError(
        'La cuota ya está pagada',
        409,
      );
    }

    cuota.pagada = true;
    cuota.metodoPago = MetodoPago.EFECTIVO;
    cuota.fechaPago = fechaPago;

    const auditoria = transactionEm.create(PagoAuditoria, {
      estadoAnterior: false,
      estadoNuevo: true,
      importe: Number(cuota.monto),
      moneda: 'ARS',
      fuente: PagoAuditoriaFuente.MANUAL,
      fecha: new Date(),
      cuota,
      administrador: Number(administradorId),
    });
    transactionEm.persist(auditoria);

    return cuota;
  });
}
