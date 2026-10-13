import type { EjecutorEmpresa } from '@orbyta/tenancy';
import { Nota } from '../domain/nota';
import type { RepositorioNotas } from '../domain/repositorio-notas';

export class RepositorioNotasPostgres implements RepositorioNotas {
  constructor(private readonly ejecutor: EjecutorEmpresa) {}

  async guardar(nota: Nota): Promise<void> {
    await this.ejecutor.ejecutar(nota.empresaId, (tx) =>
      tx.consultar('INSERT INTO ejemplo_notas (id, empresa_id, titulo) VALUES ($1, $2, $3)', [
        nota.id,
        nota.empresaId,
        nota.titulo,
      ]),
    );
  }

  async listar(empresaId: string): Promise<Nota[]> {
    const filas = await this.ejecutor.ejecutar(empresaId, (tx) =>
      tx.consultar<{ id: string; empresa_id: string; titulo: string }>(
        'SELECT id, empresa_id, titulo FROM ejemplo_notas ORDER BY titulo',
      ),
    );
    return filas.map((f) => Nota.crear({ id: f.id, empresaId: f.empresa_id, titulo: f.titulo }));
  }
}
