import { Pool } from 'pg';
import { EmpresaRequeridaError, type EjecutorEmpresa, type Transaccion } from '../port';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class EjecutorEmpresaPostgres implements EjecutorEmpresa {
  private readonly pool: Pool;

  constructor(urlConexion: string) {
    this.pool = new Pool({ connectionString: urlConexion, max: 4 });
  }

  async ejecutar<T>(empresaId: string, trabajo: (tx: Transaccion) => Promise<T>): Promise<T> {
    if (!empresaId || !UUID.test(empresaId)) throw new EmpresaRequeridaError();
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');
      // Equivale a SET LOCAL app.empresa_id: dura solo esta transacción.
      await cliente.query("SELECT set_config('app.empresa_id', $1, true)", [empresaId]);
      const tx: Transaccion = {
        consultar: async <R>(sql: string, parametros: unknown[] = []) =>
          (await cliente.query(sql, parametros)).rows as R[],
      };
      const resultado = await trabajo(tx);
      await cliente.query('COMMIT');
      return resultado;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  async cerrar(): Promise<void> {
    await this.pool.end();
  }
}
