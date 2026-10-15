-- Se ejecuta con el rol de migraciones. Crea el esquema de pg-boss y deja que la app (sin DDL)
-- use las tablas que el instalador cree después. Solo afecta al esquema pgboss.
CREATE SCHEMA IF NOT EXISTS pgboss AUTHORIZATION orbyta_migraciones;
GRANT USAGE ON SCHEMA pgboss TO orbyta_app;

ALTER DEFAULT PRIVILEGES FOR ROLE orbyta_migraciones IN SCHEMA pgboss
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO orbyta_app;
ALTER DEFAULT PRIVILEGES FOR ROLE orbyta_migraciones IN SCHEMA pgboss
  GRANT USAGE, SELECT ON SEQUENCES TO orbyta_app;
ALTER DEFAULT PRIVILEGES FOR ROLE orbyta_migraciones IN SCHEMA pgboss
  GRANT EXECUTE ON FUNCTIONS TO orbyta_app;
