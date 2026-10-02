import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/.storybook/**',
            '{projectRoot}/src/**/*.stories.tsx',
            '{projectRoot}/src/**/*.spec.{ts,tsx}',
            '{projectRoot}/src/test-setup.ts',
            '{projectRoot}/{tailwind,postcss}.config.js',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
