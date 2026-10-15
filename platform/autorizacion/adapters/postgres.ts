import type { EjecutorEmpresa } from '@orbyta/tenancy';
import type { AdministradorRoles, Autorizador } from '../port';

export class AutorizacionPostgres implements Autorizador, AdministradorRoles {
  constructor(private readonly ejecutor: EjecutorEmpresa) {}

  async puede(empresaId: string, usuarioId: string, permiso: string): Promise<boolean> {
    const filas = await this.ejecutor.ejecutar(empresaId, (tx) =>
      tx.consultar(
        `SELECT 1
           FROM rbac_asignaciones a
           JOIN rbac_permisos_rol p
             ON p.empresa_id = a.empresa_id AND p.rol = a.rol
          WHERE a.empresa_id = $1 AND a.usuario_id = $2 AND p.permiso = $3
          LIMIT 1`,
        [empresaId, usuarioId, permiso],
      ),
    );
    return filas.length > 0;
  }

  async definirRol(empresaId: string, rol: string, permisos: string[]): Promise<void> {
    await this.ejecutor.ejecutar(empresaId, async (tx) => {
      await tx.consultar('DELETE FROM rbac_permisos_rol WHERE empresa_id = $1 AND rol = $2', [empresaId, rol]);
      for (const permiso of new Set(permisos)) {
        await tx.consultar('INSERT INTO rbac_permisos_rol (empresa_id, rol, permiso) VALUES ($1, $2, $3)', [
          empresaId,
          rol,
          permiso,
        ]);
      }
    });
  }

  async asignarRol(empresaId: string, usuarioId: string, rol: string): Promise<void> {
    await this.ejecutor.ejecutar(empresaId, (tx) =>
      tx.consultar(
        'INSERT INTO rbac_asignaciones (empresa_id, usuario_id, rol) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [empresaId, usuarioId, rol],
      ),
    );
  }

  async revocarRol(empresaId: string, usuarioId: string, rol: string): Promise<void> {
    await this.ejecutor.ejecutar(empresaId, (tx) =>
      tx.consultar('DELETE FROM rbac_asignaciones WHERE empresa_id = $1 AND usuario_id = $2 AND rol = $3', [
        empresaId,
        usuarioId,
        rol,
      ]),
    );
  }
}
