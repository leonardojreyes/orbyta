const { join } = require('path');
const preset = require('@orbyta/tokens/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    join(__dirname, 'src/**/*.{ts,tsx}'),
    join(__dirname, '../../packages/ui/src/**/*.{ts,tsx}'),
  ],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="claro"]) & }',
      '[data-theme="oscuro"] &',
    ],
  ],
  plugins: [],
};
