import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModulo } from './app.modulo';
import { componer } from './composicion';
import { cargarConfiguracion } from './config/config';
import { LoggerJson, registrar } from './logger';
import { middlewarePeticion } from './peticion.middleware';

async function arrancar() {
  const config = cargarConfiguracion();
  const { ejecutor, validador, cola, casosDeUso } = componer(config);
  const app = await NestFactory.create(AppModulo.con(validador, casosDeUso), { logger: new LoggerJson() });
  app.use(middlewarePeticion);
  app.enableShutdownHooks();
  app.getHttpAdapter().getInstance().on('close', () => void Promise.all([ejecutor.cerrar(), cola.cerrar()]));
  await app.listen(config.puerto);
  registrar('info', 'API iniciada', { perfil: config.perfil, puerto: config.puerto });
}

arrancar().catch((error) => {
  registrar('error', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
