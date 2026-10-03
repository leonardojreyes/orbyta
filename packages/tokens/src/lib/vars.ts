import { base, temas, type NombreTema } from '../generado/tema';

/**
 * Variables CSS (`--color-fondo`, `--espacio-4`, …) de un tema como objeto.
 * En React Native se aplican con `vars()` de NativeWind en la raíz de la app, ya que no hay hoja de estilos CSS.
 */
export const varsDeTema = (tema: NombreTema): Record<string, string> => ({
  ...Object.fromEntries(Object.entries(base).map(([k, v]) => [`--${k}`, v])),
  ...Object.fromEntries(
    Object.entries(temas[tema]).map(([k, v]) => [`--color-${k}`, v]),
  ),
});
