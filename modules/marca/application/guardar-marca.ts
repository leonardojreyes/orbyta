import type { AlmacenArchivos } from '@orbyta/archivos';
import { validarLogo } from '../domain/logo';
import { MarcaEmpresa } from '../domain/marca';
import type { RepositorioMarca } from '../domain/repositorio-marca';

export class GuardarMarca {
  constructor(
    private readonly marcas: RepositorioMarca,
    private readonly archivos: AlmacenArchivos,
  ) {}

  async ejecutar(entrada: { empresaId: string; colorPrimario: string; logo?: Uint8Array }): Promise<void> {
    const { empresaId, colorPrimario, logo } = entrada;
    if (logo) validarLogo(logo);
    const anterior = await this.marcas.obtener(empresaId);
    // Valida el color antes de tocar el almacén.
    MarcaEmpresa.crear({ empresaId, colorPrimario });

    const logoNuevo = logo ? await this.archivos.guardar(empresaId, logo) : undefined;
    try {
      await this.marcas.guardar(
        MarcaEmpresa.crear({ empresaId, colorPrimario, logoId: logoNuevo ?? anterior?.logoId }),
      );
    } catch (error) {
      if (logoNuevo) await this.archivos.eliminar(empresaId, logoNuevo);
      throw error;
    }
    if (logoNuevo && anterior?.logoId) await this.archivos.eliminar(empresaId, anterior.logoId);
  }
}
