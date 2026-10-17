import js from '@eslint/js';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Colores y tamaños salen de packages/tokens; los textos, del catálogo es-EC.
// Límites: ESLint no revisa CSS, y la fuente se cubre prohibiendo `style` y los valores arbitrarios.
const color = String.raw`(^|[^\w&])#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|color-mix)\(`;
const tamano = String.raw`\d(\.\d+)?(px|rem|em|vh|vw|pt)\b`;

const prohibir = (regex, mensaje) =>
  ['Literal', 'TemplateElement'].map((nodo) => ({
    selector: `${nodo}[${nodo === 'Literal' ? 'value' : 'value.raw'}=/${regex}/]`,
    message: mensaje,
  }));

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', '**/coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/vite.config.ts', '**/generado/**'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: ['orbyta'] },
      ],
      'no-restricted-syntax': [
        'error',
        ...prohibir(color, 'Color literal: usa una variable de packages/tokens.'),
        ...prohibir(tamano, 'Tamaño literal: usa un token de packages/tokens.'),
        {
          selector: 'JSXAttribute[name.name=/^(aria-label|title|placeholder|alt)$/] > Literal',
          message: 'Texto literal en atributo: sácalo del catálogo es-EC.',
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'Sin `style` en línea: usa clases con variables de packages/tokens.',
        },
      ],
    },
  },
);
