import { defineConfig, devices } from '@playwright/test';

const PUERTO_WEB = 4300;
const PUERTO_STORYBOOK = 6007;

/**
 * Accesibilidad en navegador real (contraste incluido).
 * Requiere `pnpm nx build web` y `pnpm nx build-storybook ui` previos.
 */
export default defineConfig({
  testDir: 'tools/a11y',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  projects: [
    {
      name: 'web',
      testMatch: /pantallas\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PUERTO_WEB}`,
        locale: 'es-EC',
      },
    },
    {
      name: 'storybook',
      testMatch: /storybook\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PUERTO_STORYBOOK}`,
        locale: 'es-EC',
      },
    },
  ],
  webServer: [
    {
      command: `pnpm exec next start apps/web -p ${PUERTO_WEB}`,
      url: `http://localhost:${PUERTO_WEB}/ingresar`,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: `node tools/scripts/servir-estatico.mjs dist/storybook ${PUERTO_STORYBOOK}`,
      url: `http://localhost:${PUERTO_STORYBOOK}/index.json`,
      reuseExistingServer: !process.env['CI'],
      timeout: 30_000,
    },
  ],
});
