-- Rol de la API (idempotente, lo aplica `pnpm db:migrate` como dueño del esquema).
-- Sin superusuario ni BYPASSRLS: así las políticas RLS se cumplen siempre.
-- Sin DELETE: el borrado de negocio es lógico (deleted_at). Sin DDL.
-- La contraseña es solo de desarrollo; en servidor se cambia con ALTER ROLE.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orbyta_app') THEN
    CREATE ROLE orbyta_app LOGIN PASSWORD 'orbyta_app' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO orbyta_app', current_database());
END $$;

GRANT USAGE ON SCHEMA public TO orbyta_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO orbyta_app;
REVOKE ALL ON _migrations FROM orbyta_app;
-- Tablas que se creen en migraciones futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO orbyta_app;
