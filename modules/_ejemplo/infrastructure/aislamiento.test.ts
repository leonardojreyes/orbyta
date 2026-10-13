import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import { CrearNota } from '../application/crear-nota';
import { ListarNotas } from '../application/listar-notas';
import { RepositorioNotasPostgres } from './repositorio-notas-postgres';

const URL_APP =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';

// Contra PostgreSQL real: una empresa no puede ver ni escribir datos de otra.
describe('aislamiento entre empresas — notas', () => {
  const ejecutor = new EjecutorEmpresaPostgres(URL_APP);
  const repo = new RepositorioNotasPostgres(ejecutor);
  const empresaA = randomUUID();
  const empresaB = randomUUID();
  afterAll(() => ejecutor.cerrar());

  it('la empresa B no ve las notas de la empresa A', async () => {
    await new CrearNota(repo).ejecutar({ empresaId: empresaA, titulo: 'Secreta de A' });
    const deB = await new ListarNotas(repo).ejecutar({ empresaId: empresaB });
    expect(deB).toHaveLength(0);
    const deA = await new ListarNotas(repo).ejecutar({ empresaId: empresaA });
    expect(deA.map((n) => n.titulo)).toContain('Secreta de A');
  });

  it('no permite insertar filas de otra empresa', async () => {
    await expect(
      ejecutor.ejecutar(empresaB, (tx) =>
        tx.consultar('INSERT INTO ejemplo_notas (id, empresa_id, titulo) VALUES ($1, $2, $3)', [
          randomUUID(),
          empresaA,
          'intruso',
        ]),
      ),
    ).rejects.toThrow();
  });

  it('una consulta sin empresa fijada falla', async () => {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: URL_APP });
    await expect(pool.query('SELECT * FROM ejemplo_notas')).rejects.toThrow();
    await pool.end();
  });
});
