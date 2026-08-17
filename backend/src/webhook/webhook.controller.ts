//en desarrollo nunca va a entrar porque se comunica con MP directamente

import { Request, Response } from 'express';
import { Payment } from 'mercadopago';
import { orm } from '../shared/orm.js';
import { mpClient } from '../config/mercadopago.config.js';
import {
  CuotaMensual,
  MetodoPago,
} from '../cuotaMensual/cuotaMensual.entity.js';

const em = orm.em;

async function webhookMercadoPago(req: Request, res: Response) {

  try {
    console.log('ENTRASYTE AL WEBHOOOOOOOOOOK');
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

    const paymentClient = new Payment(mpClient);
    const pagoInfo = await paymentClient.get({ id: String(paymentId) });

    const cuotaId = Number(pagoInfo.external_reference);
    const cuota = await em.findOne(CuotaMensual, { id: cuotaId });
    if (!cuota) return res.status(200).send();

    if (pagoInfo.status === 'approved' && !cuota.pagada) {
      cuota.pagada = true;
      cuota.metodoPago = MetodoPago.MERCADO_PAGO;
      cuota.fechaPago = new Date();
      cuota.mercadoPagoPaymentId = String(pagoInfo.id);
      await em.flush();
    }

    res.status(200).send();
  } catch (error: any) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(200).send(); // 200 igual, para que MP no reintente en loop
  }
}

export { webhookMercadoPago };