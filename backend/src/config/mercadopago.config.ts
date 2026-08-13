import { MercadoPagoConfig } from 'mercadopago';
import 'dotenv/config';

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});
