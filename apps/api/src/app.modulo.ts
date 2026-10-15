import { type DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import type { ValidadorToken } from '@orbyta/identidad';
import { AutenticacionGuard } from './autenticacion.guard';
import { SaludControlador } from './salud.controlador';

@Module({})
export class AppModulo {
  /** `validador` llega de la raíz de composición; sin él, las rutas no públicas responden 401. */
  static con(validador?: ValidadorToken): DynamicModule {
    return {
      module: AppModulo,
      controllers: [SaludControlador],
      providers: [
        {
          provide: APP_GUARD,
          inject: [Reflector],
          useFactory: (reflector: Reflector) => new AutenticacionGuard(reflector, validador),
        },
      ],
    };
  }
}
