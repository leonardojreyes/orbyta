const { join } = require('path');
const nativewind = require('nativewind/preset');
const tokens = require('@orbyta/tokens/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [nativewind, tokens],
  content: [join(__dirname, 'src/**/*.{ts,tsx}'), join(__dirname, 'index.js')],
};
