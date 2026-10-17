import { contraste } from './contraste';

/** Duplica el token `color.primario`; la prueba cruzada vive en `apps/api`. */
export const COLOR_PRIMARIO_PREDETERMINADO = '#1d4ed8';

const TEXTO_SOBRE_PRIMARIO_CLARO = '#ffffff';
const FONDO_CLARO = '#ffffff';

export class ColorInvalidoError extends Error {
  constructor() {
    super('El color primario debe tener el formato #RRGGBB');
    this.name = 'ColorInvalidoError';
  }
}

export class ColorNoAccesibleError extends Error {
  constructor() {
    super('El color primario no cumple el contraste mínimo de accesibilidad (WCAG AA)');
    this.name = 'ColorNoAccesibleError';
  }
}

/** El tema oscuro usa un primario aclarado propio; el color de empresa se valida en el tema claro. */
export const validarColorPrimario = (color: string): void => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) throw new ColorInvalidoError();
  if (
    contraste(color, TEXTO_SOBRE_PRIMARIO_CLARO) < 4.5 ||
    contraste(color, FONDO_CLARO) < 3
  ) {
    throw new ColorNoAccesibleError();
  }
};

export class MarcaEmpresa {
  private constructor(
    readonly empresaId: string,
    readonly colorPrimario: string,
    readonly logoId?: string,
  ) {}

  static crear(datos: { empresaId: string; colorPrimario: string; logoId?: string }): MarcaEmpresa {
    validarColorPrimario(datos.colorPrimario);
    return new MarcaEmpresa(datos.empresaId, datos.colorPrimario, datos.logoId);
  }
}
