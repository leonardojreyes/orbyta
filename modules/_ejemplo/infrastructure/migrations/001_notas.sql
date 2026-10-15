-- Se ejecuta con el rol de migraciones (dueño de las tablas). El rol de la app no es dueño.
CREATE TABLE IF NOT EXISTS ejemplo_notas (
  id         uuid PRIMARY KEY,
  empresa_id uuid NOT NULL,
  titulo     text NOT NULL
);

ALTER TABLE ejemplo_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejemplo_notas FORCE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_empresa ON ejemplo_notas
  USING (empresa_id = current_setting('app.empresa_id')::uuid)
  WITH CHECK (empresa_id = current_setting('app.empresa_id')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ejemplo_notas TO orbyta_app;
