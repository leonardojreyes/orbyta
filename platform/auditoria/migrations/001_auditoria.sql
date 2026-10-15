-- Se ejecuta con el rol de migraciones (dueño de las tablas). El rol de la app no es dueño.
CREATE TABLE IF NOT EXISTS auditoria_eventos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  usuario_id text NOT NULL,
  accion     text NOT NULL,
  recurso    text,
  detalle    jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auditoria_empresa_fecha ON auditoria_eventos (empresa_id, creado_en DESC);

ALTER TABLE auditoria_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_eventos FORCE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_empresa ON auditoria_eventos
  USING (empresa_id = current_setting('app.empresa_id')::uuid)
  WITH CHECK (empresa_id = current_setting('app.empresa_id')::uuid);

-- Append-only: la app puede registrar y leer, nunca modificar ni borrar.
GRANT SELECT, INSERT ON auditoria_eventos TO orbyta_app;
