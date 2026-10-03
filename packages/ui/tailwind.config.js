const { join } = require('path');
const preset = require('@orbyta/tokens/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    join(__dirname, 'src/**/*.{ts,tsx}'),
    join(__dirname, '.storybook/**/*.{ts,tsx}'),
  ],
};
