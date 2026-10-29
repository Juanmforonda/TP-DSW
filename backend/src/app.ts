import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { socioRouter } from './socio/socio.routes.js';
import { tipoEmbarcacionRouter } from './tipoEmbarcacion/tipoEmbarcacion.routes.js';
import { administradorRouter } from './administrador/administrador.routes.js';
import { embarcacionRouter } from './embarcacion/embarcacion.routes.js';
import { boxRouter } from './box/box.routes.js';
import { amarraRouter } from './amarra/amarra.routes.js';
import { afiliacionRouter } from './afiliacion/afiliacion.routes.js';
import { cuotaMensualRouter } from './cuotaMensual/cuotaMensual.routes.js';
import { reservaEmbarcacionClubRouter } from './reservaEmbarcacionClub/reservaEmbarcacionClub.routes.js';
import { reservaInfraestructuraRouter } from './reservaInfraestructura/reservaInfraestructura.routes.js';
import { reservaTravelLiftRouter } from './reservaTravelLift/reservaTravelLift.routes.js';
import { orm, syncSchema } from './shared/orm.js';
import { RequestContext } from '@mikro-orm/mysql';
import { authRouter } from './auth/auth.routes.js';
import { webhookRouter } from './webhook/webhook.routes.js';
import { requireAuth, requireRole } from './auth/auth.middleware.js';

const app = express();
app.set('trust proxy', 1); //para que no detecte el proxy de Render como un cliente(y no haya problemas con el rate limit)

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173, http://localhost:5174'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req, res) => res.status(200).send('ok'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Demasiadas solicitudes desde esta IP, reintente más tarde.',
    },
  }),
);

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api', authRouter);
app.use('/api/socios', requireAuth, socioRouter);
app.use('/api/tiposEmbarcacion', requireAuth, tipoEmbarcacionRouter);
app.use('/api/embarcaciones', requireAuth, embarcacionRouter);
app.use('/api/administradores', requireAuth, requireRole('admin'), administradorRouter);
app.use('/api/boxes', requireAuth, boxRouter);
app.use('/api/amarras', requireAuth, amarraRouter);
app.use('/api/afiliaciones', requireAuth, afiliacionRouter);
app.use('/api/cuotasMensuales', requireAuth, cuotaMensualRouter);
app.use('/api/reservasEmbarcacionClub', requireAuth, reservaEmbarcacionClubRouter);
app.use('/api/reservasInfraestructura', requireAuth, reservaInfraestructuraRouter);
app.use('/api/reservasTravelLift', requireAuth, reservaTravelLiftRouter);
if (process.env.MP_ENABLED === 'true') {
  app.use('/api/webhooks', webhookRouter);
}
app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

if (process.env.NODE_ENV !== 'production') {
  await syncSchema();
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
