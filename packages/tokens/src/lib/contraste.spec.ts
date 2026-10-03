import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { contraste, PARES_CONTRASTE } from './contraste';
import { temas } from '../generado/tema';

describe('contraste WCAG 2.2 AA de los tokens', () => {
  it('calcula la razón de contraste conocida', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  for (const tema of ['claro', 'oscuro'] as const) {
    describe(`tema ${tema}`, () => {
      for (const par of PARES_CONTRASTE) {
        // El acento teal es decorativo en el tema claro (no se usa como texto ni como foco).
        if (tema === 'claro' && par.primer === 'acento') continue;
        it(`${par.descripcion} (mín. ${par.minimo})`, () => {
          const colores = temas[tema];
          expect(
            contraste(colores[par.primer], colores[par.fondo]),
          ).toBeGreaterThanOrEqual(par.minimo);
        });
      }
    });
  }

  it('el halo de foco claro (teal) es solo decorativo y el anillo es el primario', () => {
    expect(temas.claro.foco).toBe(temas.claro.primario);
  });
});

describe('artefactos generados', () => {
  it('están al día con los tokens fuente', () => {
    const script = join(__dirname, '..', '..', 'scripts', 'generar.mjs');
    expect(() =>
      execFileSync(process.execPath, [script, '--check'], { stdio: 'pipe' }),
    ).not.toThrow();
  });
});
