import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { varsDeTema } from './vars';

describe('varsDeTema', () => {
  // Style Dictionary escribe los colores en minúsculas: se compara sin distinguir mayúsculas.
  const css = readFileSync(
    join(__dirname, '..', 'generado', 'variables.css'),
    'utf8',
  ).toLowerCase();

  it('expone las mismas variables que el CSS web, con los mismos valores', () => {
    for (const tema of ['claro', 'oscuro'] as const) {
      const vars = varsDeTema(tema);
      for (const [nombre, valor] of Object.entries(vars)) {
        expect(css).toContain(`${nombre}: ${valor};`.toLowerCase());
      }
    }
  });

  it('cambia los colores entre temas pero no el espaciado', () => {
    const claro = varsDeTema('claro');
    const oscuro = varsDeTema('oscuro');
    expect(claro['--color-fondo']).not.toBe(oscuro['--color-fondo']);
    expect(claro['--espacio-4']).toBe(oscuro['--espacio-4']);
  });
});
