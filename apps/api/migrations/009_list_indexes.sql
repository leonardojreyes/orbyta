-- Listados con página (Fase 2): índice para el orden por defecto de /service-orders (más recientes primero).
-- El orden por código ya lo cubre UNIQUE (tenant_id, code); por nombre, customers_name_idx y technicians_name_idx.
-- La búsqueda de texto (ilike '%…%') sigue recorriendo solo las filas de la empresa: un índice trigram (pg_trgm) queda
-- para cuando el volumen lo pida (ver docs/arquitectura.md, ADR-11).
CREATE INDEX service_orders_recent_idx ON service_orders (tenant_id, created_at DESC, id) WHERE deleted_at IS NULL;
