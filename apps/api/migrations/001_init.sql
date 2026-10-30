-- Orbyta · esquema inicial
-- Reglas: UUID en todas las PK (generables en cliente para offline), tenant_id en toda tabla de negocio,
-- updated_at + deleted_at (borrado lógico) para sincronización, Row-Level Security por empresa.

CREATE TABLE tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  code        text NOT NULL,
  name        text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','on_hold','done')),
  start_date  date,
  end_date    date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  project_id  uuid NOT NULL REFERENCES projects(id),
  title       text NOT NULL,
  status      text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  assignee    text,
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX tasks_project_idx ON tasks (tenant_id, project_id);

CREATE TABLE service_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  code          text NOT NULL,
  customer_name text NOT NULL,
  address       text NOT NULL,
  description   text NOT NULL,
  priority      text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','done','cancelled')),
  assigned_to   text,
  project_id    uuid REFERENCES projects(id),
  lat           double precision,
  lng           double precision,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  UNIQUE (tenant_id, code)
);
CREATE INDEX service_orders_status_idx ON service_orders (tenant_id, status);
CREATE INDEX service_orders_updated_idx ON service_orders (tenant_id, updated_at);

-- Row-Level Security: cada consulta solo ve filas de la empresa fijada en app.tenant_id
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','tasks','service_orders'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY tenant_isolation ON %I
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)$p$, t);
  END LOOP;
END $$;
