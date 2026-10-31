-- Autenticación local (1.6): usuarios por empresa y sesiones.
-- Los usuarios se buscan con la empresa ya fijada (login por código de empresa + correo), así RLS se mantiene.

CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  email          text NOT NULL,
  name           text NOT NULL,
  role           text NOT NULL CHECK (role IN ('admin','supervisor','technician')),
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  password_hash  text NOT NULL,
  technician_id  uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, technician_id) REFERENCES technicians (tenant_id, id)
);

-- token_hash: SHA-256 del secreto de la cookie; el secreto nunca se guarda.
CREATE TABLE sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  user_id     uuid NOT NULL,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  FOREIGN KEY (tenant_id, user_id) REFERENCES users (tenant_id, id)
);
CREATE INDEX sessions_user_idx ON sessions (tenant_id, user_id);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','sessions'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY tenant_isolation ON %I
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)$p$, t);
  END LOOP;
END $$;
