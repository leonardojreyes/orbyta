import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import type { AdministradorRoles, Autorizador } from './port';
import { AutorizacionPostgres } from './adapters/postgres';

const URL_APP =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';

const ejecutor = new EjecutorEmpresaPostgres(URL_APP);
afterAll(() => ejecutor.cerrar());

// Todo adaptador de Autorizador y AdministradorRoles, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => Autorizador & AdministradorRoles]> = [
  ['postgres', () => new AutorizacionPostgres(ejecutor)],
];

describe.each(adaptadores)('contrato Autorizador — %s', (_nombre, crear) => {
  const a = crear();
  const empresaA = randomUUID();
  const empresaB = randomUUID();

  it('concede solo los permisos del rol asignado', async () => {
    await a.definirRol(empresaA, 'editor', ['nota:leer', 'nota:crear']);
    await a.asignarRol(empresaA, 'ana', 'editor');
    expect(await a.puede(empresaA, 'ana', 'nota:crear')).toBe(true);
    expect(await a.puede(empresaA, 'ana', 'nota:borrar')).toBe(false);
  });

  it('deniega a un usuario sin rol', async () => {
    expect(await a.puede(empresaA, 'luis', 'nota:leer')).toBe(false);
  });

  it('un rol de la empresa A no concede nada en la empresa B', async () => {
    expect(await a.puede(empresaB, 'ana', 'nota:crear')).toBe(false);
    await a.asignarRol(empresaB, 'ana', 'editor');
    expect(await a.puede(empresaB, 'ana', 'nota:crear')).toBe(false);
  });

  it('revocar el rol retira el permiso', async () => {
    await a.revocarRol(empresaA, 'ana', 'editor');
    expect(await a.puede(empresaA, 'ana', 'nota:crear')).toBe(false);
  });
});

describe('aislamiento entre empresas — RBAC', () => {
  const empresaA = randomUUID();
  const empresaB = randomUUID();
  const a = new AutorizacionPostgres(ejecutor);

  it('la empresa B no ve roles ni asignaciones de la empresa A', async () => {
    await a.definirRol(empresaA, 'admin', ['todo']);
    await a.asignarRol(empresaA, 'ana', 'admin');
    const deB = await ejecutor.ejecutar(empresaB, async (tx) => ({
      roles: await tx.consultar('SELECT * FROM rbac_permisos_rol'),
      asignaciones: await tx.consultar('SELECT * FROM rbac_asignaciones'),
    }));
    expect(deB.roles).toHaveLength(0);
    expect(deB.asignaciones).toHaveLength(0);
  });

  it('no permite escribir filas de otra empresa', async () => {
    await expect(
      ejecutor.ejecutar(empresaB, (tx) =>
        tx.consultar('INSERT INTO rbac_asignaciones (empresa_id, usuario_id, rol) VALUES ($1, $2, $3)', [
          empresaA,
          'intruso',
          'admin',
        ]),
      ),
    ).rejects.toThrow();
  });
});
