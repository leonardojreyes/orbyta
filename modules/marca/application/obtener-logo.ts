import type { AlmacenArchivos } from '@orbyta/archivos';
import type { RepositorioMarca } from '../domain/repositorio-marca';

export class ObtenerLogo {
  constructor(
    private readonly marcas: RepositorioMarca,
    private readonly archivos: AlmacenArchivos,
  ) {}

  async ejecutar(empresaId: string): Promise<Uint8Array | null> {
    const marca = await this.marcas.obtener(empresaId);
    if (!marca?.logoId) return null;
    return this.archivos.leer(empresaId, marca.logoId);
  }
}
