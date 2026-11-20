
import crypto from 'node:crypto';
import { Request, Response } from 'express';
import { validateAndApplyMercadoPago } from '../cuotaMensual/cuotaMensual.payment.service.js';

const WEBHOOK_MAX_AGE_SECONDS = 5 * 60;

function getSignaturePart(signature: string, key: string) {
  return signature
    .split(',')
    .map((part) => part.trim().split('='))
    .find(([partKey]) => partKey === key)?.[1];
}

function isValidSignature(req: Request, paymentId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const signature = req.header('x-signature');
  const requestId = req.header('x-request-id');
  const timestamp = signature
    ? getSignaturePart(signature, 'ts')
    : undefined;
  const receivedHash = signature
    ? getSignaturePart(signature, 'v1')
    : undefined;

  if (!secret || !signature || !requestId || !timestamp || !receivedHash) {
    return false;
  }

  const timestampNumber = Number(timestamp);
  if (
    !Number.isInteger(timestampNumber) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) >
      WEBHOOK_MAX_AGE_SECONDS
  ) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');
  const receivedBuffer = Buffer.from(receivedHash, 'utf8');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

async function webhookMercadoPago(req: Request, res: Response) {

  try {
    let paymentId = (req.query['data.id'] as string) || req.body?.data?.id;
    let topic = (req.query['type'] as string) || req.body?.type;

    // formato viejo, cuando llega por notification_url de la preferencia
    if (!paymentId) {
      topic = topic || (req.query['topic'] as string) || req.body?.topic;
      const resource = (req.query['id'] as string) || req.body?.resource;
      // Para topic 'payment', resource es directamente el id (string numérico).

      if (
        topic === 'payment' &&
        resource &&
        !String(resource).startsWith('http') //por si el topic es merchant_order (no se porque tira eso)
      ) {
        paymentId = resource;
      }
    }

    if (topic !== 'payment' || !paymentId) {
      return res.status(200).send(); // no es un evento de pago, igual respondemos 200
    }

    if (!isValidSignature(req, String(paymentId))) {
      return res.status(401).json({ message: 'Firma de webhook inválida' });
    }

    await validateAndApplyMercadoPago(String(paymentId));

    res.status(200).send();
  } catch (error: any) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(200).send(); // 200 igual, para que MP no reintente en loop
  }
}

export { isValidSignature, webhookMercadoPago };