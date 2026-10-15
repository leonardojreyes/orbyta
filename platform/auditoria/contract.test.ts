import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import type { Auditor } from './port';
import { AuditorPostgres } from './adapters/postgres';

const URL_APP =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';

const ejecutor = new EjecutorEmpresaPostgres(URL_APP);
afterAll(() => ejecutor.cerrar());

// Todo adaptador de Auditor, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => Auditor]> = [['postgres', () => new AuditorPostgres(ejecutor)]];

describe.each(adaptadores)('contrato Auditor — %s', (_nombre, crear) => {
  const auditor = crear();

  it('registra quién, qué, cuándo y en qué empresa', async () => {
    const empresaId = randomUUID();
    const antes = Date.now() - 1000;
    await auditor.registrar({
      empresaId,
      usuarioId: 'ana',
      accion: 'nota.crear',
      recurso: 'nota-1',
      detalle: { origen: 'api' },
    });
    const [evento] = await auditor.listar(empresaId);
    expect(evento).toMatchObject({
      empresaId,
      usuarioId: 'ana',
      accion: 'nota.crear',
      recurso: 'nota-1',
      detalle: { origen: 'api' },
    });
    expect(evento.creadoEn.getTime()).toBeGreaterThanOrEqual(antes);
  });

  it('lista del más reciente al más antiguo', async () => {
    const empresaId = randomUUID();
    await auditor.registrar({ empresaId, usuarioId: 'ana', accion: 'a.primero' });
    await new Promise((r) => setTimeout(r, 10));
    await auditor.registrar({ empresaId, usuarioId: 'ana', accion: 'a.segundo' });
    const acciones = (await auditor.listar(empresaId)).map((e) => e.accion);
    expect(acciones).toEqual(['a.segundo', 'a.primero']);
  });

  it('la empresa B no ve los eventos de la empresa A', async () => {
    const empresaA = randomUUID();
    const empresaB = randomUUID();
    await auditor.registrar({ empresaId: empresaA, usuarioId: 'ana', accion: 'secreta' });
    expect(await auditor.listar(empresaB)).toHaveLength(0);
  });
});

describe('inmutabilidad y aislamiento de la tabla de auditoría', () => {
  const empresaA = randomUUID();
  const empresaB = randomUUID();

  it('el rol de la app no puede modificar ni borrar eventos', async () => {
    await new AuditorPostgres(ejecutor).registrar({ empresaId: empresaA, usuarioId: 'ana', accion: 'x' });
    await expect(
      ejecutor.ejecutar(empresaA, (tx) => tx.consultar("UPDATE auditoria_eventos SET accion = 'otra'")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      ejecutor.ejecutar(empresaA, (tx) => tx.consultar('DELETE FROM auditoria_eventos')),
    ).rejects.toThrow(/permission denied/);
  });

  it('no permite registrar eventos a nombre de otra empresa', async () => {
    await expect(
      ejecutor.ejecutar(empresaB, (tx) =>
        tx.consultar('INSERT INTO auditoria_eventos (empresa_id, usuario_id, accion) VALUES ($1, $2, $3)', [
          empresaA,
          'intruso',
          'falsa',
        ]),
      ),
    ).rejects.toThrow();
  });
});
