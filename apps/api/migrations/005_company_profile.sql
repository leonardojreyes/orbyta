-- Datos de empresa (1.5). `tenants` es la tabla raíz de empresas: no lleva tenant_id ni RLS;
-- la API solo la modifica filtrando por la empresa de la solicitud (ver routes/company.ts).
ALTER TABLE tenants
  ADD COLUMN tax_id     text,
  ADD COLUMN address    text,
  ADD COLUMN phone      text,
  ADD COLUMN email      text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
-- logo_url guarda una imagen pequeña como data URL (png, jpeg, webp o svg; máx. ~200 KB).
