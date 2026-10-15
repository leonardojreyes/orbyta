import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import { TareaInvalidaError, type ColaTareas } from './port';
import { ColaTareasPgBoss, instalarCola, leerSobre } from './adapters/pgboss';

const URL_APP =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';
const URL_MIGRACIONES =
  process.env.DATABASE_MIGRACIONES_URL ??
  'postgres://orbyta_migraciones:orbyta_migraciones@localhost:5432/orbyta';

const COLA = `prueba-${randomUUID().slice(0, 8)}`;
const ejecutor = new EjecutorEmpresaPostgres(URL_APP);

const esperar = async (condicion: () => boolean, ms = 8000) => {
  const limite = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > limite) throw new Error('Tiempo agotado esperando la tarea');
    await new Promise((r) => setTimeout(r, 50));
  }
};

// Todo adaptador de ColaTareas, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => ColaTareas]> = [['pg-boss', () => new ColaTareasPgBoss(URL_APP)]];

describe.each(adaptadores)('contrato ColaTareas — %s', (_nombre, crear) => {
  const cola = crear();
  const recibidas: Array<{ empresaId: string; carga: unknown; vista: string }> = [];

  beforeAll(async () => {
    await instalarCola(URL_MIGRACIONES, [COLA]);
    await cola.trabajar(COLA, async (empresaId, carga) => {
      // El manejador actúa con la empresa de la tarea, no con otra.
      const vista = await ejecutor.ejecutar(empresaId, async (tx) =>
        (await tx.consultar<{ e: string }>("SELECT current_setting('app.empresa_id') AS e"))[0].e,
      );
      recibidas.push({ empresaId, carga, vista });
    });
  }, 30000);

  afterAll(async () => {
    await cola.cerrar();
    await ejecutor.cerrar();
  });

  it('entrega la tarea confirmada con su empresa y su carga', async () => {
    const empresa = randomUUID();
    const marca = randomUUID();
    await ejecutor.ejecutar(empresa, (tx) => cola.encolar(tx, empresa, COLA, { marca }));
    await esperar(() => recibidas.some((r) => (r.carga as { marca: string }).marca === marca));
    const r = recibidas.find((x) => (x.carga as { marca: string }).marca === marca)!;
    expect(r.empresaId).toBe(empresa);
    expect(r.vista).toBe(empresa);
  });

  it('una transacción revertida no deja tarea', async () => {
    const empresa = randomUUID();
    const marca = randomUUID();
    await expect(
      ejecutor.ejecutar(empresa, async (tx) => {
        await cola.encolar(tx, empresa, COLA, { marca });
        throw new Error('fallo de negocio');
      }),
    ).rejects.toThrow('fallo de negocio');
    await new Promise((r) => setTimeout(r, 1500));
    expect(recibidas.some((x) => (x.carga as { marca: string }).marca === marca)).toBe(false);
  });

  it('las tareas de dos empresas se ejecutan cada una con la suya', async () => {
    const a = randomUUID();
    const b = randomUUID();
    const marcaA = randomUUID();
    const marcaB = randomUUID();
    await ejecutor.ejecutar(a, (tx) => cola.encolar(tx, a, COLA, { marca: marcaA }));
    await ejecutor.ejecutar(b, (tx) => cola.encolar(tx, b, COLA, { marca: marcaB }));
    await esperar(() => [marcaA, marcaB].every((m) => recibidas.some((r) => (r.carga as { marca: string }).marca === m)));
    const deA = recibidas.find((r) => (r.carga as { marca: string }).marca === marcaA)!;
    const deB = recibidas.find((r) => (r.carga as { marca: string }).marca === marcaB)!;
    expect([deA.empresaId, deA.vista]).toEqual([a, a]);
    expect([deB.empresaId, deB.vista]).toEqual([b, b]);
  });

  it('rechaza encolar sin empresa válida', async () => {
    const empresa = randomUUID();
    await expect(
      ejecutor.ejecutar(empresa, (tx) => cola.encolar(tx, 'no-es-uuid', COLA, {})),
    ).rejects.toThrow();
  });
});

describe('leerSobre', () => {
  it('acepta un sobre con empresa válida', () => {
    const empresaId = randomUUID();
    expect(leerSobre({ empresaId, carga: { x: 1 } })).toEqual({ empresaId, carga: { x: 1 } });
  });

  it.each([null, 'texto', {}, { empresaId: 'no-es-uuid' }, { empresaId: 5 }])(
    'rechaza un sobre inválido: %j',
    (datos) => {
      expect(() => leerSobre(datos)).toThrow(TareaInvalidaError);
    },
  );
});
