import { BadRequestException, Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { type CrearNota, type ListarNotas, esquemaCrearNota } from '@orbyta/modulo-ejemplo';
import { contextoActual } from './contexto';

export const CASOS_NOTAS = Symbol('CASOS_NOTAS');
export interface CasosNotas {
  crearNota: CrearNota;
  listarNotas: ListarNotas;
}

/** Ruta de ejemplo: la empresa sale siempre de la identidad verificada, nunca del cuerpo. */
@Controller('notas')
export class NotasControlador {
  constructor(@Inject(CASOS_NOTAS) private readonly casos: CasosNotas) {}

  @Get()
  async listar() {
    const { empresaId } = contextoActual();
    const notas = await this.casos.listarNotas.ejecutar({ empresaId });
    return notas.map((n) => ({ id: n.id, titulo: n.titulo }));
  }

  @Post()
  async crear(@Body() cuerpo: unknown) {
    const dto = esquemaCrearNota.safeParse(cuerpo);
    if (!dto.success) throw new BadRequestException('Cuerpo inválido');
    const { empresaId } = contextoActual();
    const nota = await this.casos.crearNota.ejecutar({ empresaId, titulo: dto.data.titulo });
    return { id: nota.id, titulo: nota.titulo };
  }
}
