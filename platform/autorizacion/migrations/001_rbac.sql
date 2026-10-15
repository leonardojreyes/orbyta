-- Se ejecuta con el rol de migraciones (dueño de las tablas). El rol de la app no es dueño.
CREATE TABLE IF NOT EXISTS rbac_permisos_rol (
  empresa_id uuid NOT NULL,
  rol        text NOT NULL,
  permiso    text NOT NULL,
  PRIMARY KEY (empresa_id, rol, permiso)
);

CREATE TABLE IF NOT EXISTS rbac_asignaciones (
  empresa_id uuid NOT NULL,
  usuario_id text NOT NULL,
  rol        text NOT NULL,
  PRIMARY KEY (empresa_id, usuario_id, rol)
);

ALTER TABLE rbac_permisos_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_permisos_rol FORCE ROW LEVEL SECURITY;
ALTER TABLE rbac_asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_asignaciones FORCE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_empresa ON rbac_permisos_rol
  USING (empresa_id = current_setting('app.empresa_id')::uuid)
  WITH CHECK (empresa_id = current_setting('app.empresa_id')::uuid);

CREATE POLICY aislamiento_empresa ON rbac_asignaciones
  USING (empresa_id = current_setting('app.empresa_id')::uuid)
  WITH CHECK (empresa_id = current_setting('app.empresa_id')::uuid);

GRANT SELECT, INSERT, DELETE ON rbac_permisos_rol TO orbyta_app;
GRANT SELECT, INSERT, DELETE ON rbac_asignaciones TO orbyta_app;
