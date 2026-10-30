-- Vincular órdenes a proyectos (1.4): la referencia debe ser de la misma empresa.
-- Reemplaza la FK simple por una compuesta con tenant_id, igual que cliente y técnico (003).
ALTER TABLE projects ADD CONSTRAINT projects_tenant_id_id_key UNIQUE (tenant_id, id);
ALTER TABLE service_orders
  DROP CONSTRAINT service_orders_project_id_fkey,
  ADD FOREIGN KEY (tenant_id, project_id) REFERENCES projects (tenant_id, id);
CREATE INDEX service_orders_project_idx ON service_orders (tenant_id, project_id);
