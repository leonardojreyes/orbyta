-- Ajustes de la bitácora tras revisión (007 ya estaba aplicada, por eso va en una migración nueva).

-- 1) Índices para cada filtro de GET /audit (todos terminan en created_at DESC, id DESC, igual que el orden y el cursor).
DROP INDEX audit_log_record_idx;
CREATE INDEX audit_log_record_idx ON audit_log (tenant_id, record_id, created_at DESC, id DESC);
CREATE INDEX audit_log_user_idx   ON audit_log (tenant_id, user_id, created_at DESC, id DESC);
CREATE INDEX audit_log_table_idx  ON audit_log (tenant_id, table_name, created_at DESC, id DESC);

-- 2) created_at con clock_timestamp(): el momento real del cambio, no el inicio de la transacción (now()).
--    Así una transacción larga no deja entradas "en el pasado" que la paginación por cursor ya dejó atrás.
CREATE OR REPLACE FUNCTION audit_row() RETURNS trigger LANGUAGE plpgsql AS $$
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

  INSERT INTO audit_log (tenant_id, table_name, record_id, record_label, action, changes, user_id, created_at)
  VALUES (tenant, TG_TABLE_NAME, (new_j->>'id')::uuid, new_j->>TG_ARGV[1], act, diff,
          NULLIF(current_setting('app.user_id', true), '')::uuid, clock_timestamp());
  RETURN NEW;
END $$;
