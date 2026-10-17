import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' });

const reglas = async (codigo, archivo) => {
  const [resultado] = await eslint.lintText(codigo, { filePath: archivo });
  return resultado.messages.map((m) => m.ruleId);
};

const web = 'apps/web/src/ejemplo.tsx';
const ui = 'packages/ui/src/ejemplo.tsx';

describe('lint de literales visuales', () => {
  it('falla con un color y un texto literal en apps/web', async () => {
    const ids = await reglas(
      `export const A = () => <p className="x" data-c={'#fff'}>Hola</p>;`,
      web,
    );
    expect(ids).toContain('react/jsx-no-literals');
    expect(ids).toContain('no-restricted-syntax');
  });

  it.each([
    ['color hexadecimal', `export const c = '#1d4ed8';`],
    ['color con función', `export const c = 'rgb(0 0 0)';`],
    ['color en plantilla', 'export const c = `hsl(${h} 50% 50%)`;'],
    ['valor arbitrario de Tailwind en color', `export const c = 'bg-[#fff]';`],
    ['tamaño en píxeles', `export const c = 'w-[12px]';`],
    ['tamaño en rem', `export const c = '1.5rem';`],
    ['atributo style', `export const A = () => <div style={{ margin: 4 }} />;`],
  ])('rechaza %s en packages/ui', async (_nombre, codigo) => {
    expect(await reglas(codigo, ui)).toContain('no-restricted-syntax');
  });

  it.each([
    ['texto hijo', `export const A = () => <p>Hola</p>;`],
    ['cadena en expresión JSX', `export const A = () => <p>{'Hola'}</p>;`],
  ])('rechaza %s literal', async (_nombre, codigo) => {
    expect(await reglas(codigo, web)).toContain('react/jsx-no-literals');
  });

  it('rechaza texto literal en atributos visibles', async () => {
    const codigo = `export const A = () => <input placeholder="Buscar" />;`;
    expect(await reglas(codigo, web)).toContain('no-restricted-syntax');
  });

  it('acepta código limpio y el nombre de marca', async () => {
    const codigo = `
      export const A = ({ t }) => (
        <section className="bg-primario p-4">
          <h1>orbyta</h1>
          <p>{t.saludo}</p>
        </section>
      );`;
    expect(await reglas(codigo, web)).toEqual([]);
  });

  it('no aplica fuera de apps/web y packages/ui, ni a las pruebas', async () => {
    const codigo = `export const c = '#fff';`;
    expect(await reglas(codigo, 'modules/x/dominio.ts')).toEqual([]);
    expect(await reglas(codigo, 'apps/web/src/ejemplo.test.tsx')).toEqual([]);
  });
});
