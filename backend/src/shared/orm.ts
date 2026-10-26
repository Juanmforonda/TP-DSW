import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import 'dotenv/config'; // carga las variables del archivo .env

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
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
  // Uncomment the following lines if you want to drop and recreate the schema
  await generator.dropSchema();
  await generator.createSchema();
  */
  await generator.updateSchema();
}