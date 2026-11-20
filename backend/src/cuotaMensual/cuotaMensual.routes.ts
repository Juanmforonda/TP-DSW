import { Router } from 'express';
import {
  sanitizeCuotaMensualInput,
  findAll,
  findOne,
  update,
  remove,
  findBySocio,
  generarCuotasDelMes,
  registrarPago,
  crearPreferenciaMP,
  confirmarPagoMP,
} from './cuotaMensual.controller.js';
import { requireRole, requireSelf, setAuthenticatedId } from '../auth/auth.middleware.js';

export const cuotaMensualRouter = Router();

const MP_ENABLED = process.env.MP_ENABLED === 'true';

if (MP_ENABLED) {
  cuotaMensualRouter.post('/mercadopago/confirmar', confirmarPagoMP);
  cuotaMensualRouter.post('/:id/mercadopago/preferencia', crearPreferenciaMP);
}
cuotaMensualRouter.get('/me', setAuthenticatedId('id'), findBySocio);
cuotaMensualRouter.get('/socio/:id', requireSelf('id'), findBySocio);
cuotaMensualRouter.get('/', requireRole('admin'), findAll);
cuotaMensualRouter.get('/:id', requireRole('admin'), findOne);
cuotaMensualRouter.post('/generar', requireRole('admin'), generarCuotasDelMes);
cuotaMensualRouter.put('/:id', requireRole('admin'), sanitizeCuotaMensualInput, update);
cuotaMensualRouter.delete('/:id', requireRole('admin'), remove);
cuotaMensualRouter.post('/:id/pago', requireRole('admin'), registrarPago);
