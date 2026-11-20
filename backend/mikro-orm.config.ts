import { defineConfig } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  entities: ['dist/**/*.entity.js'],
  dbName: process.env.DB_NAME,
  clientUrl: `mysql://${process.env.DB_USER}:${encodeURIComponent(String(process.env.DB_PASSWORD ?? ''))}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  highlighter: new SqlHighlighter(),
  debug: !isProduction,
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
  migrations: {
    path: 'dist/src/migrations',
    pathTs: 'src/migrations',
    transactional: true,
  },
  allowGlobalContext: false,
  driverOptions:
    process.env.DB_SSL === 'true'
      ? { connection: { ssl: { rejectUnauthorized: false } } }
      : {},
});
