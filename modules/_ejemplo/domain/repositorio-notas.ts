import type { Nota } from './nota';

export interface RepositorioNotas {
  guardar(nota: Nota): Promise<void>;
  listar(empresaId: string): Promise<Nota[]>;
}
