import { defineConfig, devices } from '@playwright/test';

const PUERTO = 4300;

/** Accesibilidad en navegador real (contraste incluido). Requiere `pnpm nx build web` previo. */
export default defineConfig({
  testDir: 'tools/a11y',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PUERTO}`, locale: 'es-EC' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec next start apps/web -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/ingresar`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
