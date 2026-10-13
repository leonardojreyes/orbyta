import { Controller, Get } from '@nestjs/common';

@Controller('salud')
export class SaludControlador {
  @Get()
  estado() {
    return { estado: 'ok' };
  }
}
