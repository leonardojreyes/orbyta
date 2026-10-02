// Genera, a partir de los tokens W3C (tokens/*.tokens.json), los artefactos que consumen web y móvil:
//   src/generado/variables.css        variables CSS (tema claro, oscuro y preferencia del sistema)
//   src/generado/tema.ts              valores resueltos por tema (React Native, pruebas)
//   src/generado/tailwind-preset.cjs  preset de Tailwind que apunta a las variables CSS
// Uso: pnpm tokens   |   pnpm tokens --check (falla si lo generado no está al día)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..');
const origen = (n) => join(raiz, 'tokens', `${n}.tokens.json`);
const salida = (n) => join(raiz, 'src', 'generado', n);
const verificar = process.argv.includes('--check');

const leer = (n) => JSON.parse(readFileSync(origen(n), 'utf8'));
const aplanar = (nodo, ruta = [], acc = {}) => {
  for (const [clave, valor] of Object.entries(nodo)) {
    if (clave.startsWith('$')) continue;
    if (valor && typeof valor === 'object' && '$value' in valor)
      acc[[...ruta, clave].join('-')] = valor.$value;
    else if (valor && typeof valor === 'object')
      aplanar(valor, [...ruta, clave], acc);
  }
  return acc;
};

const bloqueCss = async (archivo, selector) => {
  const sd = new StyleDictionary({
    source: [origen(archivo)],
    platforms: {
      css: {
        transformGroup: 'css',
        files: [
          {
            destination: 'x.css',
            format: 'css/variables',
            options: { selector, outputReferences: false },
          },
        ],
      },
    },
  });
  const [{ output }] = await sd.formatPlatform('css');
  return output
    .split('\n')
    .filter((l) => l.startsWith(selector) || l.startsWith('  --') || l === '}')
    .join('\n');
};

const sangrar = (texto, n) =>
  texto
    .split('\n')
    .map((l) => (l ? ' '.repeat(n) + l : l))
    .join('\n');

const base = aplanar(leer('base'));
const claro = aplanar(leer('claro'));
const oscuro = aplanar(leer('oscuro'));

const sinPrefijo = (m) =>
  Object.fromEntries(
    Object.entries(m).map(([k, v]) => [k.replace(/^color-/, ''), v]),
  );
const css = [
  '/* GENERADO por packages/tokens/scripts/generar.mjs. No editar a mano. */',
  await bloqueCss('base', ':root'),
  '',
  await bloqueCss('claro', ':root'),
  '',
  '/* Preferencia del sistema, salvo que el usuario fuerce el tema claro */',
  '@media (prefers-color-scheme: dark) {',
  sangrar(await bloqueCss('oscuro', ':root:not([data-theme="claro"])'), 2),
  '}',
  '',
  '/* Tema oscuro forzado por el usuario */',
  await bloqueCss('oscuro', '[data-theme="oscuro"]'),
  '',
].join('\n');

const ts = `// GENERADO por packages/tokens/scripts/generar.mjs. No editar a mano.
export const base = ${JSON.stringify(base, null, 2)} as const;

export const temas = {
  claro: ${JSON.stringify(sinPrefijo(claro), null, 4).replace(/\n/g, '\n  ')},
  oscuro: ${JSON.stringify(sinPrefijo(oscuro), null, 4).replace(/\n/g, '\n  ')},
} as const;

export type NombreTema = keyof typeof temas;
export type NombreColor = keyof (typeof temas)['claro'];
`;

const v = (n) => `var(--${n})`;
const colores = Object.fromEntries(
  Object.keys(claro).map((k) => [k.replace(/^color-/, ''), v(k)]),
);
const por = (prefijo) =>
  Object.fromEntries(
    Object.keys(base)
      .filter((k) => k.startsWith(prefijo + '-'))
      .map((k) => [k.slice(prefijo.length + 1), v(k)]),
  );
const tamanos = Object.fromEntries(
  Object.keys(por('texto')).map((k) => [
    k,
    [v(`texto-${k}`), { lineHeight: v(`interlineado-${k}`) }],
  ]),
);
const espacios = Object.fromEntries(
  Object.keys(por('espacio')).map((k) => [`espacio-${k}`, v(`espacio-${k}`)]),
);
const tactil = Object.fromEntries(
  Object.keys(por('tactil')).map((k) => [`tactil-${k}`, v(`tactil-${k}`)]),
);
const filas = Object.fromEntries(
  Object.keys(por('fila')).map((k) => [`fila-${k}`, v(`fila-${k}`)]),
);

const preset = `// GENERADO por packages/tokens/scripts/generar.mjs. No editar a mano.
// Los colores se sobrescriben por completo: solo existen los de los tokens (sin valores sueltos).
module.exports = {
  theme: {
    colors: ${JSON.stringify({ transparent: 'transparent', current: 'currentColor', ...colores }, null, 6).replace(/\n/g, '\n    ')},
    extend: {
      spacing: ${JSON.stringify({ ...espacios, ...tactil, ...filas }, null, 8).replace(/\n/g, '\n      ')},
      borderRadius: ${JSON.stringify(por('radio'), null, 8).replace(/\n/g, '\n      ')},
      boxShadow: ${JSON.stringify(por('sombra'), null, 8).replace(/\n/g, '\n      ')},
      fontSize: ${JSON.stringify(tamanos, null, 8).replace(/\n/g, '\n      ')},
      fontFamily: { sans: [${JSON.stringify(v('fuente-sistema'))}], mono: [${JSON.stringify(v('fuente-mono'))}] },
      minHeight: ${JSON.stringify({ ...tactil, ...filas }, null, 8).replace(/\n/g, '\n      ')},
      minWidth: ${JSON.stringify(tactil, null, 8).replace(/\n/g, '\n      ')},
    },
  },
};
`;

const archivos = {
  'variables.css': css,
  'tema.ts': ts,
  'tailwind-preset.cjs': preset,
};
let desactualizado = 0;
for (const [nombre, contenido] of Object.entries(archivos)) {
  const ruta = salida(nombre);
  if (verificar) {
    if (!existsSync(ruta) || readFileSync(ruta, 'utf8') !== contenido) {
      console.error(
        `Desactualizado: src/generado/${nombre} (ejecuta pnpm tokens)`,
      );
      desactualizado += 1;
    }
  } else {
    writeFileSync(ruta, contenido);
    console.log(`generado src/generado/${nombre}`);
  }
}
if (desactualizado > 0) process.exit(1);
