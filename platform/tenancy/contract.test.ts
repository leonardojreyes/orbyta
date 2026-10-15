import { afterAll, describe, expect, it } from 'vitest';
import { EmpresaRequeridaError, type EjecutorEmpresa } from './port';
import { EjecutorEmpresaPostgres } from './adapters/postgres';

const URL_APP =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';
const EMPRESA = '11111111-1111-1111-1111-111111111111';

// Todo adaptador de EjecutorEmpresa, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => EjecutorEmpresa]> = [
  ['postgres', () => new EjecutorEmpresaPostgres(URL_APP)],
];

describe.each(adaptadores)('contrato EjecutorEmpresa — %s', (_nombre, crear) => {
  const ejecutor = crear();
  afterAll(() => ejecutor.cerrar());

  it('fija la empresa dentro de la transacción', async () => {
    const filas = await ejecutor.ejecutar(EMPRESA, (tx) =>
      tx.consultar<{ e: string }>("SELECT current_setting('app.empresa_id') AS e"),
    );
    expect(filas[0].e).toBe(EMPRESA);
  });

  it('rechaza una empresa vacía o inválida', async () => {
    await expect(ejecutor.ejecutar('', async () => 1)).rejects.toBeInstanceOf(EmpresaRequeridaError);
    await expect(ejecutor.ejecutar('no-es-uuid', async () => 1)).rejects.toBeInstanceOf(
      EmpresaRequeridaError,
    );
  });

  it('revierte la transacción si el trabajo falla', async () => {
    await expect(
      ejecutor.ejecutar(EMPRESA, async () => {
        throw new Error('fallo');
      }),
    ).rejects.toThrow('fallo');
  });
});
