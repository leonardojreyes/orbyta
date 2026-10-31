-- Adjuntos de órdenes de servicio (Fase 2): fotos de la falla. El archivo vive en el almacenamiento (disco o S3,
-- ver src/storage.ts); aquí solo van los metadatos y la clave del archivo.

-- Para que el adjunto solo pueda apuntar a una orden de su misma empresa (FK compuesta, como en 003/004).
ALTER TABLE service_orders ADD CONSTRAINT service_orders_tenant_id_id_key UNIQUE (tenant_id, id);

CREATE TABLE attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  order_id      uuid NOT NULL,
  storage_key   text NOT NULL UNIQUE,   -- <empresa>/<orden>/<id>.<ext>; lo genera el servidor, nunca el cliente
  file_name     text NOT NULL,          -- nombre original, solo para mostrar
  content_type  text NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp')),
  size_bytes    integer NOT NULL CHECK (size_bytes > 0),
  uploaded_by   uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  FOREIGN KEY (tenant_id, order_id)    REFERENCES service_orders (tenant_id, id),
  FOREIGN KEY (tenant_id, uploaded_by) REFERENCES users (tenant_id, id)
);
CREATE INDEX attachments_order_idx ON attachments (tenant_id, order_id, created_at) WHERE deleted_at IS NULL;

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON attachments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE TRIGGER audit AFTER INSERT OR UPDATE ON attachments FOR EACH ROW EXECUTE FUNCTION audit_row('', 'file_name');
