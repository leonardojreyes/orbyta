/** Decide si un usuario puede ejecutar un permiso dentro de una empresa. Sin rol o sin permiso: false. */
export interface Autorizador {
  puede(empresaId: string, usuarioId: string, permiso: string): Promise<boolean>;
}

/** Gestión de roles de una empresa. Los roles y sus asignaciones nunca cruzan empresas. */
export interface AdministradorRoles {
  /** Reemplaza los permisos del rol. */
  definirRol(empresaId: string, rol: string, permisos: string[]): Promise<void>;
  asignarRol(empresaId: string, usuarioId: string, rol: string): Promise<void>;
  revocarRol(empresaId: string, usuarioId: string, rol: string): Promise<void>;
}
