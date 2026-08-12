import { Router } from 'express';
import {sanitizeCuotaMensualInput, findAll, findOne, update, remove, findBySocio, generarCuotasDelMes, registrarPago} from './cuotaMensual.controller.js';

export const cuotaMensualRouter = Router();

cuotaMensualRouter.get('/', findAll);
cuotaMensualRouter.get('/:id', findOne);
cuotaMensualRouter.post('/generar', generarCuotasDelMes); // trigger manual, después  cronearlo
cuotaMensualRouter.put('/:id', sanitizeCuotaMensualInput, update);
cuotaMensualRouter.delete('/:id', remove);
cuotaMensualRouter.get('/socio/:id', findBySocio);
cuotaMensualRouter.post('/:id/pago', registrarPago);

