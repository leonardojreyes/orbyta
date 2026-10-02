import { temas, type NombreColor } from '../generado/tema';

/** Luminancia relativa WCAG de un color `#RRGGBB`. */
const luminancia = (hex: string): number => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
};

/** Razón de contraste WCAG entre dos colores `#RRGGBB`. */
export const contraste = (a: string, b: string): number => {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort(
    (x, y) => y - x,
  ) as [number, number];
  return (claro + 0.05) / (oscuro + 0.05);
};

export interface ParContraste {
  /** Texto o elemento gráfico */
  primer: NombreColor;
  /** Fondo sobre el que se dibuja */
  fondo: NombreColor;
  /** 4.5 texto normal; 3 componentes de interfaz, iconos y foco */
  minimo: 3 | 4.5;
  descripcion: string;
}

const texto = (
  primer: NombreColor,
  fondo: NombreColor,
  descripcion: string,
): ParContraste => ({
  primer,
  fondo,
  minimo: 4.5,
  descripcion,
});
const grafico = (
  primer: NombreColor,
  fondo: NombreColor,
  descripcion: string,
): ParContraste => ({
  primer,
  fondo,
  minimo: 3,
  descripcion,
});

/** Pares que se usan en pantalla. Deben cumplir WCAG 2.2 AA en los dos temas. */
export const PARES_CONTRASTE: readonly ParContraste[] = [
  texto('texto', 'fondo', 'texto principal sobre el fondo'),
  texto('texto', 'superficie', 'texto principal sobre superficie'),
  texto('texto-secundario', 'fondo', 'texto secundario sobre el fondo'),
  texto('texto-secundario', 'superficie', 'texto secundario sobre superficie'),
  texto('primario', 'fondo', 'enlace sobre el fondo'),
  texto('primario', 'superficie', 'enlace sobre superficie'),
  texto('primario-texto', 'primario', 'texto de botón primario'),
  texto('primario-texto', 'primario-hover', 'texto de botón primario en hover'),
  texto('exito-texto', 'fondo', 'texto de éxito sobre el fondo'),
  texto('exito-texto', 'superficie', 'texto de éxito sobre superficie'),
  texto('exito-relleno-texto', 'exito-relleno', 'texto sobre relleno de éxito'),
  texto('advertencia-texto', 'fondo', 'texto de advertencia sobre el fondo'),
  texto(
    'advertencia-texto',
    'superficie',
    'texto de advertencia sobre superficie',
  ),
  texto(
    'advertencia-relleno-texto',
    'advertencia-relleno',
    'texto sobre relleno de advertencia',
  ),
  texto('error', 'fondo', 'texto de error sobre el fondo'),
  texto('error', 'superficie', 'texto de error sobre superficie'),
  texto('error-texto', 'error', 'texto sobre botón de peligro'),
  texto('chip-neutro-texto', 'chip-neutro-fondo', 'chip registrada'),
  texto('chip-curso-texto', 'chip-curso-fondo', 'chip en curso'),
  texto('chip-cerrada-texto', 'chip-cerrada-fondo', 'chip cerrada'),
  texto('chip-riesgo-texto', 'chip-riesgo-fondo', 'chip en riesgo'),
  texto('chip-vencida-texto', 'chip-vencida-fondo', 'chip vencida'),
  grafico('borde-campo', 'fondo', 'borde de campo sobre el fondo'),
  grafico('borde-campo', 'superficie', 'borde de campo sobre superficie'),
  grafico('foco', 'fondo', 'anillo de foco sobre el fondo'),
  grafico('foco', 'superficie', 'anillo de foco sobre superficie'),
  grafico(
    'acento',
    'superficie',
    'acento sobre superficie (solo en tema oscuro cumple como gráfico)',
  ),
];

export const nombresPares = (tema: keyof typeof temas): string[] =>
  PARES_CONTRASTE.map((p) => `${tema}: ${p.descripcion}`);
