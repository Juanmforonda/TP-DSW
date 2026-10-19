import 'reflect-metadata';
import { DemoSeeder } from './seeders/demo.seeder.js';
import { orm, syncSchema } from './shared/orm.js';

try {
  await syncSchema();
  const em = orm.em.fork();
  await new DemoSeeder().run(em);
  await em.flush();
  console.log('Datos de demostración cargados correctamente.');
} catch (error) {
  console.error('No se pudieron cargar los datos de demostración:', error);
  process.exitCode = 1;
} finally {
  await orm.close();
}
