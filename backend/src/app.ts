import 'reflect-metadata'
import express from 'express'
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { socioRouter } from './socio/socio.routes.js'
import { tipoEmbarcacionRouter } from './tipoEmbarcacion/tipoEmbarcacion.routes.js'
import { administradorRouter } from './administrador/administrador.routes.js'
import { embarcacionRouter } from './embarcacion/embarcacion.routes.js'
import { boxRouter } from './box/box.routes.js'
import { amarraRouter } from './amarra/amarra.routes.js'
import { afiliacionRouter } from './afiliacion/afiliacion.routes.js'
import { cuotaMensualRouter } from './cuotaMensual/cuotaMensual.routes.js'
import { reservaEmbarcacionClubRouter } from './reservaEmbarcacionClub/reservaEmbarcacionClub.routes.js'
import { reservaInfraestructuraRouter } from './reservaInfraestructura/reservaInfraestructura.routes.js'
import { reservaTravelLiftRouter } from './reservaTravelLift/reservaTravelLift.routes.js'
import { orm, syncSchema } from './shared/orm.js'
import { RequestContext } from '@mikro-orm/mysql'
import { authRouter } from './auth/auth.routes.js'
import { webhookRouter } from './webhook/webhook.routes.js'

const app = express()
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes desde esta IP, reintente más tarde.' },
}));

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use('/api/socios', socioRouter)
app.use('/api/tiposEmbarcacion', tipoEmbarcacionRouter)
app.use('/api/embarcaciones', embarcacionRouter)
app.use('/api/administradores', administradorRouter)
app.use('/api/boxes', boxRouter)
app.use('/api/amarras', amarraRouter)
app.use('/api/afiliaciones', afiliacionRouter)
app.use('/api/cuotasMensuales', cuotaMensualRouter)
app.use('/api', authRouter)
app.use('/api/reservasEmbarcacionClub', reservaEmbarcacionClubRouter)
app.use('/api/reservasInfraestructura', reservaInfraestructuraRouter)
app.use('/api/reservasTravelLift', reservaTravelLiftRouter)
app.use('/api/webhooks', webhookRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

if (process.env.NODE_ENV !== 'production') {
  await syncSchema()
}

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/')
})
