import type { MarcaEmpresa } from '../domain/marca';
import type { RepositorioMarca } from '../domain/repositorio-marca';

export class RepositorioMarcaMemoria implements RepositorioMarca {
  private readonly marcas = new Map<string, MarcaEmpresa>();

  async obtener(empresaId: string): Promise<MarcaEmpresa | null> {
    return this.marcas.get(empresaId) ?? null;
  }

  async guardar(marca: MarcaEmpresa): Promise<void> {
    this.marcas.set(marca.empresaId, marca);
  }
}
