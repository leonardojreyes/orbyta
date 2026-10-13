import { randomUUID } from 'node:crypto';
import { Nota } from '../domain/nota';
import type { RepositorioNotas } from '../domain/repositorio-notas';

export class CrearNota {
  constructor(private readonly notas: RepositorioNotas) {}

  async ejecutar(entrada: { empresaId: string; titulo: string }): Promise<Nota> {
    const nota = Nota.crear({ id: randomUUID(), ...entrada });
    await this.notas.guardar(nota);
    return nota;
  }
}
