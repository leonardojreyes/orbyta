-- Panel de indicadores: "primera vez que cada orden pasó a terminada" agrega los eventos de la empresa en cada consulta.
-- Índice parcial solo con esos eventos, en el orden del GROUP BY (orden, fecha).
CREATE INDEX service_order_events_done_idx ON service_order_events (tenant_id, order_id, created_at)
  WHERE to_status = 'done' AND from_status IS NOT NULL AND deleted_at IS NULL;
