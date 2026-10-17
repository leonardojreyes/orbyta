import { COLOR_PRIMARIO_PREDETERMINADO, validarColorPrimario } from '../domain/marca';
import type { RepositorioMarca } from '../domain/repositorio-marca';

export class ObtenerMarca {
  constructor(private readonly marcas: RepositorioMarca) {}

  async ejecutar(empresaId: string): Promise<{ colorPrimario: string; tieneLogo: boolean }> {
    const marca = await this.marcas.obtener(empresaId);
    if (!marca) return { colorPrimario: COLOR_PRIMARIO_PREDETERMINADO, tieneLogo: false };
    try {
      validarColorPrimario(marca.colorPrimario);
    } catch {
      return { colorPrimario: COLOR_PRIMARIO_PREDETERMINADO, tieneLogo: marca.logoId !== undefined };
    }
    return { colorPrimario: marca.colorPrimario, tieneLogo: marca.logoId !== undefined };
  }
}
