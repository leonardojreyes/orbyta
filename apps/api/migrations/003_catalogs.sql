-- Catálogos de clientes y técnicos (1.3); las órdenes de servicio los referencian.

CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  name        text NOT NULL,
  tax_id      text,
  phone       text,
  email       text,
  address     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, id)
);
CREATE INDEX customers_name_idx ON customers (tenant_id, name);

CREATE TABLE technicians (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  name        text NOT NULL,
  phone       text,
  email       text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, id)
);
CREATE INDEX technicians_name_idx ON technicians (tenant_id, name);

-- Las órdenes conservan customer_name / assigned_to como texto (copia del nombre al momento de la orden).
-- La llave compuesta con tenant_id impide referenciar un cliente o técnico de otra empresa.
ALTER TABLE service_orders
  ADD COLUMN customer_id   uuid,
  ADD COLUMN technician_id uuid,
  ADD FOREIGN KEY (tenant_id, customer_id)   REFERENCES customers (tenant_id, id),
  ADD FOREIGN KEY (tenant_id, technician_id) REFERENCES technicians (tenant_id, id);
CREATE INDEX service_orders_customer_idx ON service_orders (tenant_id, customer_id);
CREATE INDEX service_orders_technician_idx ON service_orders (tenant_id, technician_id);

-- Catálogos iniciales a partir de las órdenes existentes
INSERT INTO customers (tenant_id, name, address)
SELECT DISTINCT ON (tenant_id, customer_name) tenant_id, customer_name, address
FROM service_orders WHERE deleted_at IS NULL ORDER BY tenant_id, customer_name, created_at;

INSERT INTO technicians (tenant_id, name)
SELECT DISTINCT tenant_id, assigned_to FROM service_orders WHERE assigned_to IS NOT NULL AND deleted_at IS NULL;

UPDATE service_orders so SET customer_id = c.id
FROM customers c WHERE c.tenant_id = so.tenant_id AND c.name = so.customer_name;
UPDATE service_orders so SET technician_id = t.id
FROM technicians t WHERE t.tenant_id = so.tenant_id AND t.name = so.assigned_to;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','technicians'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY tenant_isolation ON %I
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)$p$, t);
  END LOOP;
END $$;
