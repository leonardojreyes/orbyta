-- Bitácora de auditoría (Fase 2): quién cambió qué y cuándo, registrado por un trigger genérico.
-- Es de solo agregar: el rol de la API no tiene UPDATE ni DELETE sobre audit_log (ver roles.sql).

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  table_name    text NOT NULL,
  record_id     uuid NOT NULL,
  record_label  text,
  action        text NOT NULL CHECK (action IN ('insert','update','delete')),
  -- insert: fila completa; update/delete: solo los campos que cambiaron como {campo: {old, new}}
  changes       jsonb NOT NULL,
  user_id       uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  FOREIGN KEY (tenant_id, user_id) REFERENCES users (tenant_id, id)
);
CREATE INDEX audit_log_recent_idx ON audit_log (tenant_id, created_at DESC, id DESC);
CREATE INDEX audit_log_record_idx ON audit_log (tenant_id, table_name, record_id, created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_log
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Trigger genérico. Argumentos: TG_ARGV[0] = columnas ocultas (se registra que cambiaron, no su valor);
-- TG_ARGV[1] = columna que da el nombre legible del registro (código, nombre, correo…).
-- El usuario sale de app.user_id, que la API fija junto con app.tenant_id (withTenant).
CREATE FUNCTION audit_row() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  hidden   text[] := string_to_array(COALESCE(TG_ARGV[0], ''), ',');
  new_j    jsonb := to_jsonb(NEW);
  tenant   uuid;
  act      text;
  diff     jsonb;
BEGIN
  tenant := CASE WHEN TG_TABLE_NAME = 'tenants' THEN (new_j->>'id')::uuid ELSE (new_j->>'tenant_id')::uuid END;

  IF TG_OP = 'INSERT' THEN
    act := 'insert';
    diff := new_j - hidden;
  ELSE
    SELECT jsonb_object_agg(n.key, jsonb_build_object(
             'old', CASE WHEN n.key = ANY (hidden) THEN '"[oculto]"'::jsonb ELSE o.value END,
             'new', CASE WHEN n.key = ANY (hidden) THEN '"[oculto]"'::jsonb ELSE n.value END))
      INTO diff
      FROM jsonb_each(new_j) n
      LEFT JOIN jsonb_each(to_jsonb(OLD)) o ON o.key = n.key
     WHERE n.key <> 'updated_at' AND n.value IS DISTINCT FROM o.value;
    IF diff IS NULL THEN RETURN NEW; END IF; -- solo cambió updated_at
    -- Por jsonb porque tenants no tiene deleted_at
    act := CASE WHEN to_jsonb(OLD)->>'deleted_at' IS NULL AND new_j->>'deleted_at' IS NOT NULL THEN 'delete' ELSE 'update' END;
  END IF;

  INSERT INTO audit_log (tenant_id, table_name, record_id, record_label, action, changes, user_id)
  VALUES (tenant, TG_TABLE_NAME, (new_j->>'id')::uuid, new_j->>TG_ARGV[1], act, diff,
          NULLIF(current_setting('app.user_id', true), '')::uuid);
  RETURN NEW;
END $$;

CREATE TRIGGER audit AFTER INSERT OR UPDATE ON projects        FOR EACH ROW EXECUTE FUNCTION audit_row('', 'code');
CREATE TRIGGER audit AFTER INSERT OR UPDATE ON tasks           FOR EACH ROW EXECUTE FUNCTION audit_row('', 'title');
CREATE TRIGGER audit AFTER INSERT OR UPDATE ON service_orders  FOR EACH ROW EXECUTE FUNCTION audit_row('', 'code');
CREATE TRIGGER audit AFTER INSERT OR UPDATE ON customers       FOR EACH ROW EXECUTE FUNCTION audit_row('', 'name');
CREATE TRIGGER audit AFTER INSERT OR UPDATE ON technicians     FOR EACH ROW EXECUTE FUNCTION audit_row('', 'name');
CREATE TRIGGER audit AFTER INSERT OR UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION audit_row('password_hash', 'email');
-- Empresa: solo cambios (la alta ocurre fuera de una sesión de empresa); el logo es una imagen grande, no se copia.
CREATE TRIGGER audit AFTER UPDATE ON tenants                   FOR EACH ROW EXECUTE FUNCTION audit_row('logo_url', 'name');
