import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const temas = ['claro', 'oscuro'] as const;
const rutas = [
  '/ingresar',
  '/',
  '/ordenes',
  '/ordenes/nueva',
  '/ordenes/os-0001',
];
const etiquetas = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const fijarTema = (page: Page, tema: (typeof temas)[number]) =>
  page.addInitScript((t) => localStorage.setItem('orbyta-tema', t), tema);

const revisar = async (page: Page) => {
  const resultado = await new AxeBuilder({ page })
    .withTags(etiquetas)
    .analyze();
  const resumen = resultado.violations.map(
    (v) =>
      `${v.impact}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`,
  );
  expect(resumen, 'violaciones de axe').toEqual([]);
};

for (const tema of temas) {
  test.describe(`tema ${tema}`, () => {
    for (const ruta of rutas) {
      test(`${ruta} sin violaciones de axe`, async ({ page }) => {
        await fijarTema(page, tema);
        await page.goto(ruta);
        await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
        await revisar(page);
      });
    }

    test('tablero de órdenes', async ({ page }) => {
      await fijarTema(page, tema);
      await page.goto('/ordenes');
      await page.getByRole('button', { name: 'Tablero' }).click();
      await revisar(page);
    });

    test('panel lateral de detalle', async ({ page }) => {
      await fijarTema(page, tema);
      await page.goto('/ordenes');
      await page.getByRole('row').nth(1).dblclick();
      await expect(page.getByRole('dialog')).toBeVisible();
      await revisar(page);
    });

    test('paleta de comandos', async ({ page }) => {
      await fijarTema(page, tema);
      await page.goto('/');
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog')).toBeVisible();
      await revisar(page);
    });

    test('formulario con errores de validación', async ({ page }) => {
      await fijarTema(page, tema);
      await page.goto('/ordenes/nueva');
      await page.getByRole('button', { name: 'Crear orden' }).click();
      await revisar(page);
    });

    test('barra lateral contraída', async ({ page }) => {
      await fijarTema(page, tema);
      await page.goto('/');
      await page
        .getByRole('button', { name: 'Contraer barra lateral' })
        .click();
      await revisar(page);
    });
  });
}
