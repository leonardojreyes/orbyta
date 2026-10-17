import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = join(__dirname, '..');
const css = readFileSync(join(raiz, 'dist', 'tokens.css'), 'utf8');

const variables = (bloque: string): Record<string, string> =>
  Object.fromEntries(
    [...bloque.matchAll(/--color-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );

const bloque = (selector: string): string => {
  const inicio = css.indexOf(`${selector} {`);
  expect(inicio, `falta ${selector}`).toBeGreaterThanOrEqual(0);
  return css.slice(inicio, css.indexOf('}', inicio));
};

const claro = variables(bloque(':root'));
const oscuro = variables(bloque('[data-tema="oscuro"]'));

const luminancia = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a: string, b: string): number => {
  const [mayor, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (mayor + 0.05) / (menor + 0.05);
};

const paresTexto: [string, string][] = [
  ['texto', 'fondo'],
  ['texto', 'superficie'],
  ['texto-secundario', 'fondo'],
  ['texto-secundario', 'superficie'],
  ['texto-sobre-primario', 'primario'],
  ['exito', 'fondo'],
  ['exito', 'superficie'],
  ['alerta', 'fondo'],
  ['alerta', 'superficie'],
  ['error', 'fondo'],
  ['error', 'superficie'],
];

const paresComponente: [string, string][] = [
  ['borde', 'fondo'],
  ['borde', 'superficie'],
  ['foco', 'fondo'],
  ['foco', 'superficie'],
  ['primario', 'fondo'],
  ['primario', 'superficie'],
];

const temas = { claro, oscuro: { ...claro, ...oscuro } };

describe.each(Object.entries(temas))('tema %s', (_nombre, tema) => {
  it.each(paresTexto)('texto %s sobre %s cumple 4,5:1', (primero, segundo) => {
    expect(contraste(tema[primero], tema[segundo])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(paresComponente)('componente %s sobre %s cumple 3:1', (primero, segundo) => {
    expect(contraste(tema[primero], tema[segundo])).toBeGreaterThanOrEqual(3);
  });
});

describe('estructura', () => {
  it('ambos temas definen las mismas claves', () => {
    expect(Object.keys(oscuro).sort()).toEqual(Object.keys(claro).sort());
  });

  it('no pide recursos externos (fuente autoalojada)', () => {
    expect(css).not.toMatch(/url\(\s*["']?(https?:)?\/\//);
    expect(css).toContain('@font-face');
    expect(css).toContain('./fonts/');
  });
});
