import { MikroORM } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import 'dotenv/config';

import { Administrador } from '../administrador/administrador.entity.js';
import { Afiliacion } from '../afiliacion/afiliacion.entity.js';
import { Amarra } from '../amarra/amarra.entity.js';
import { Box } from '../box/box.entity.js';
import { CuotaMensual } from '../cuotaMensual/cuotaMensual.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { ReservaEmbarcacionClub } from '../reservaEmbarcacionClub/reservaEmbarcacionClub.entity.js';
import { ReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { ReservaTravelLift } from '../reservaTravelLift/reservaTravelLift.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { TipoEmbarcacion } from '../tipoEmbarcacion/tipoEmbarcacion.entity.js';

export const orm = await MikroORM.init({
  entities: [
    Administrador,
    Afiliacion,
    Amarra,
    Box,
    CuotaMensual,
    DetalleCuota,
    Embarcacion,
    ReservaEmbarcacionClub,
    ReservaInfraestructura,
    ReservaTravelLift,
    Socio,
    TipoEmbarcacion,
  ],

  dbName: process.env.DB_NAME,

  clientUrl: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,

  highlighter: new SqlHighlighter(),

  debug: true,

  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();

  /*
  await generator.dropSchema();
  await generator.createSchema();
  */

  await generator.updateSchema();
};