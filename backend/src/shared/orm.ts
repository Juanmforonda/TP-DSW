import { MikroORM } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: process.env.DB_NAME,
  clientUrl: `mysql://${process.env.DB_USER}:${encodeURIComponent(String(process.env.DB_PASSWORD ?? ''))}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  highlighter: new SqlHighlighter(),
  debug: !isProduction,
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
  allowGlobalContext: false,
  driverOptions:
    process.env.DB_SSL === 'true'
      ? { connection: { ssl: { rejectUnauthorized: false } } }
      : {},
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  if (isProduction) {
    return;
  }
  await generator.updateSchema();
};