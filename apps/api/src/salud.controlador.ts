import { Controller, Get } from '@nestjs/common';
import { Publico } from './autenticacion.guard';

@Publico()
@Controller('salud')
export class SaludControlador {
  @Get()
  estado() {
    return { estado: 'ok' };
  }
}
