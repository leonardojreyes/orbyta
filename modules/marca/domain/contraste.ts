const canal = (hex: string, desde: number): number => {
  const c = parseInt(hex.slice(desde, desde + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminancia = (hex: string): number =>
  0.2126 * canal(hex, 1) + 0.7152 * canal(hex, 3) + 0.0722 * canal(hex, 5);

/** Razón de contraste WCAG 2.2 entre dos colores `#RRGGBB` (de 1 a 21). */
export const contraste = (a: string, b: string): number => {
  const [mayor, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return ((mayor ?? 0) + 0.05) / ((menor ?? 0) + 0.05);
};
