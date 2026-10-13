import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModulo } from './app.modulo';
import { componer } from './composicion';
import { cargarConfiguracion } from './config/config';

async function arrancar() {
  const config = cargarConfiguracion();
  const { ejecutor } = componer(config);
  const app = await NestFactory.create(AppModulo, { logger: ['error', 'warn', 'log'] });
  app.enableShutdownHooks();
  app.getHttpAdapter().getInstance().on('close', () => void ejecutor.cerrar());
  await app.listen(config.puerto);
  console.log(JSON.stringify({ nivel: 'info', mensaje: 'API iniciada', perfil: config.perfil, puerto: config.puerto }));
}

arrancar().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
