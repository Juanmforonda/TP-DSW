import { MikroORM } from '@mikro-orm/mysql';
import config from '../../mikro-orm.config.js';

const isProduction = process.env.NODE_ENV === 'production';

export const orm = await MikroORM.init(config);

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  if (isProduction) {
    return;
  }
  await generator.updateSchema();
};