import { Router } from 'express';
import { webhookMercadoPago } from './webhook.controller.js';

export const webhookRouter = Router();
webhookRouter.post('/mercadopago', webhookMercadoPago);
