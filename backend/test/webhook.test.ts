import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/shared/orm.js', () => ({
  orm: {
    em: {
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      transactional: vi.fn(),
    },
  },
}));

import { isValidSignature } from '../src/webhook/webhook.controller.js';

function makeRequest(
  signature: string,
  requestId: string,
  paymentId: string,
) {
  const headers: Record<string, string> = {
    'x-signature': signature,
    'x-request-id': requestId,
  };

  return {
    headers,
    header(name: string) {
      return headers[name];
    },
  } as Parameters<typeof isValidSignature>[0];
}

describe('Firma de webhook de Mercado Pago', () => {
  const secret = 'webhook-secret';
  const requestId = 'request-123';
  const paymentId = '456';

  it('acepta una firma válida dentro de la ventana permitida', () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');
    const previousSecret = process.env.MP_WEBHOOK_SECRET;
    process.env.MP_WEBHOOK_SECRET = secret;

    try {
      expect(
        isValidSignature(
          makeRequest(`ts=${timestamp},v1=${hash}`, requestId, paymentId),
          paymentId,
        ),
      ).toBe(true);
    } finally {
      process.env.MP_WEBHOOK_SECRET = previousSecret;
    }
  });

  it('rechaza una firma alterada', () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const previousSecret = process.env.MP_WEBHOOK_SECRET;
    process.env.MP_WEBHOOK_SECRET = secret;

    try {
      expect(
        isValidSignature(
          makeRequest(`ts=${timestamp},v1=invalid`, requestId, paymentId),
          paymentId,
        ),
      ).toBe(false);
    } finally {
      process.env.MP_WEBHOOK_SECRET = previousSecret;
    }
  });

  it('rechaza una firma fuera de la ventana temporal', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 301;
    const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');
    const previousSecret = process.env.MP_WEBHOOK_SECRET;
    process.env.MP_WEBHOOK_SECRET = secret;

    try {
      expect(
        isValidSignature(
          makeRequest(`ts=${timestamp},v1=${hash}`, requestId, paymentId),
          paymentId,
        ),
      ).toBe(false);
    } finally {
      process.env.MP_WEBHOOK_SECRET = previousSecret;
    }
  });
});
