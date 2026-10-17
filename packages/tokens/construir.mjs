import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import StyleDictionary from 'style-dictionary';

const raiz = import.meta.dirname;
const fuentes = join(raiz, 'node_modules/@fontsource-variable/inter/files');

// Rangos tomados de @fontsource-variable/inter; latin cubre el español.
const subconjuntos = [
  {
    archivo: 'inter-latin-ext-wght-normal.woff2',
    rango:
      'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  },
  {
    archivo: 'inter-latin-wght-normal.woff2',
    rango:
      'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  },
];

const nombre = (token) =>
  `--${token.path.filter((p) => p !== 'claro' && p !== 'oscuro').join('-')}`;
const lineas = (tokens) => tokens.map((t) => `  ${nombre(t)}: ${t.$value ?? t.value};`).join('\n');
const esTema = (token, tema) => token.path[0] === 'color' && token.path[1] === tema;

StyleDictionary.registerFormat({
  name: 'css/temas',
  format: ({ dictionary }) => {
    const todos = dictionary.allTokens;
    const comunes = todos.filter((t) => !esTema(t, 'claro') && !esTema(t, 'oscuro'));
    const claro = todos.filter((t) => esTema(t, 'claro'));
    const oscuro = todos.filter((t) => esTema(t, 'oscuro'));
    const fuente = subconjuntos
      .map(
        (s) => `@font-face {
  font-family: 'Inter Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('./fonts/${s.archivo}') format('woff2-variations');
  unicode-range: ${s.rango};
}`,
      )
      .join('\n');
    return `/* Generado por construir.mjs; no editar. */\n${fuente}\n\n:root {\n${lineas([...claro, ...comunes])}\n}\n\n[data-tema="oscuro"] {\n${lineas(oscuro)}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'ts/temas',
  format: ({ dictionary }) => {
    const por = (tema) =>
      Object.fromEntries(
        dictionary.allTokens
          .filter((t) => esTema(t, tema))
          .map((t) => [t.path[2], t.$value ?? t.value]),
      );
    return `// Generado por construir.mjs; no editar.\nexport const temas = ${JSON.stringify({ claro: por('claro'), oscuro: por('oscuro') }, null, 2)} as const;\n\nexport type Tema = keyof typeof temas;\nexport type ColorSemantico = keyof (typeof temas)['claro'];\n\nexport const colorPrimarioPredeterminado = temas.claro.primario;\n`;
  },
});

StyleDictionary.registerTransform({
  name: 'name/ruta',
  type: 'name',
  transform: (token) => token.path.join('-'),
});

const sd = new StyleDictionary({
  source: [join(raiz, 'src/tokens.json')],
  platforms: {
    css: {
      transforms: ['name/ruta'],
      buildPath: join(raiz, 'dist/'),
      files: [{ destination: 'tokens.css', format: 'css/temas' }],
    },
    ts: {
      transforms: ['name/ruta'],
      buildPath: join(raiz, 'src/generado/'),
      files: [{ destination: 'temas.ts', format: 'ts/temas' }],
    },
  },
});

await sd.buildAllPlatforms();
await mkdir(join(raiz, 'dist/fonts'), { recursive: true });
for (const { archivo } of subconjuntos) {
  await cp(join(fuentes, archivo), join(raiz, 'dist/fonts', archivo));
}
await writeFile(join(raiz, 'src/generado/.gitkeep'), '');
