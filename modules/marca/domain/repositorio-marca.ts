import type { MarcaEmpresa } from './marca';

export interface RepositorioMarca {
  obtener(empresaId: string): Promise<MarcaEmpresa | null>;
  guardar(marca: MarcaEmpresa): Promise<void>;
}
