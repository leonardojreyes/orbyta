import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const temas = ['claro', 'oscuro'] as const;
const etiquetas = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** El complemento de accesibilidad de Storybook también ejecuta axe; reintenta si ya hay una ejecución. */
const analizar = async (page: Page) => {
  for (let intento = 0; ; intento += 1) {
    try {
      return await new AxeBuilder({ page })
        .withTags(etiquetas)
        .include('body')
        .analyze();
    } catch (error) {
      if (intento >= 20 || !String(error).includes('Axe is already running'))
        throw error;
      await page.waitForTimeout(500);
    }
  }
};

interface Entrada {
  id: string;
  title: string;
  name: string;
  type: string;
}

test('todas las historias de Storybook cumplen axe en ambos temas', async ({
  page,
  request,
}) => {
  test.setTimeout(300_000);
  const indice = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, Entrada>;
  };
  const historias = Object.values(indice.entries).filter(
    (e) => e.type === 'story',
  );
  expect(historias.length, 'historias encontradas').toBeGreaterThan(30);

  const fallos: string[] = [];
  for (const tema of temas) {
    for (const h of historias) {
      await page.goto(
        `/iframe.html?id=${h.id}&viewMode=story&globals=tema:${tema}`,
      );
      await page.waitForSelector(
        '#storybook-root > *, [role="dialog"], [data-radix-popper-content-wrapper]',
        { timeout: 10_000 },
      );
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      // Sin transiciones: axe no debe medir colores a mitad de una animación.
      await page.addStyleTag({
        content:
          '*, ::before, ::after { transition: none !important; animation: none !important; }',
      });
      const r = await analizar(page);
      for (const v of r.violations)
        fallos.push(
          `[${tema}] ${h.title} / ${h.name}: ${v.impact} ${v.id} → ${v.nodes[0]?.target.join(' ')}`,
        );
    }
  }
  expect(fallos, 'violaciones de axe').toEqual([]);
});
