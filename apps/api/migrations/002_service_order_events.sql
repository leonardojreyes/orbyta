-- Historial de cambios de estado de las órdenes de servicio (1.2)

CREATE TABLE service_order_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  order_id    uuid NOT NULL REFERENCES service_orders(id),
  from_status text CHECK (from_status IN ('open','assigned','in_progress','done','cancelled')),
  to_status   text NOT NULL CHECK (to_status IN ('open','assigned','in_progress','done','cancelled')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX service_order_events_order_idx ON service_order_events (tenant_id, order_id, created_at);

-- Eventos de las órdenes que ya existen: un "creada" con su estado actual
INSERT INTO service_order_events (tenant_id, order_id, from_status, to_status, created_at)
SELECT tenant_id, id, NULL, status, created_at FROM service_orders;

ALTER TABLE service_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON service_order_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
