import 'reflect-metadata'
import express from 'express'
import { socioRouter } from './socio/socio.routes.js'
import { tipoEmbarcacionRouter } from './tipoEmbarcacion/tipoEmbarcacion.routes.js'
import { administradorRouter } from './administrador/administrador.routes.js'
import { embarcacionRouter } from './embarcacion/embarcacion.routes.js'
import { boxRouter } from './box/box.routes.js'
import { amarraRouter } from './amarra/amarra.routes.js'
import { afiliacionRouter } from './afiliacion/afiliacion.routes.js'
import { cuotaMensualRouter } from './cuotaMensual/cuotaMensual.routes.js'
import {reservaEmbarcacionClubRouter} from './reservaEmbarcacionClub/reservaEmbarcacionClub.routes.js'
import { reservaInfraestructuraRouter } from './reservaInfraestructura/reservaInfraestructura.routes.js'
import {orm, syncSchema} from './shared/orm.js'
import { RequestContext } from '@mikro-orm/mysql'
import { authRouter } from './auth/auth.routes.js'

import cors from 'cors'; 

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Permitir ambos puertos
}));
app.use(express.json())


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



app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

await syncSchema()  //Nunca llamar a esto en producción, solo para desarrollo

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
