import type { Nota } from '../domain/nota';
import type { RepositorioNotas } from '../domain/repositorio-notas';

export class ListarNotas {
  constructor(private readonly notas: RepositorioNotas) {}

  ejecutar(entrada: { empresaId: string }): Promise<Nota[]> {
    return this.notas.listar(entrada.empresaId);
  }
}
