# Avance

## 2026-10-30 · 1.2 Detalle de orden de servicio
- Migración `002_service_order_events.sql`: historial de estados por orden (con RLS) y evento "creada" para las órdenes existentes.
- API: `PATCH /service-orders/:id` registra el cambio de estado en la misma transacción (con `FOR UPDATE`); nuevo `GET /service-orders/:id/events` (404 si la orden no existe).
- Web: panel lateral (`OrderPanel.tsx`) al hacer clic en una orden: edita cliente, dirección, falla, prioridad, estado y técnico, y muestra el historial.
- `OrderUpdate.assignedTo` acepta `null` para poder quitar al técnico.
- **Problema encontrado y corregido:** la API se conectaba con el rol `leo` (superusuario, `bypassrls`), así que RLS no filtraba nada y una empresa podía leer y modificar datos de otra. La verificación de RLS de 1.1 no era válida.
- **Corrección:** dos conexiones. `DATABASE_URL` = rol `orbyta_app` (sin superusuario, sin `bypassrls`, solo SELECT/INSERT/UPDATE, sin DELETE ni DDL) para la API; `DATABASE_ADMIN_URL` = dueño del esquema para `db:migrate`, `db:seed` y `db:reset`. `apps/api/roles.sql` crea el rol y reaplica permisos en cada migración. Prueba: `pnpm --filter @orbyta/api db:check-rls` (12 comprobaciones; se niega a correr con un rol privilegiado).
- **Siguiente paso:** 1.3 Catálogos de clientes y técnicos. Regla nueva: correr `db:check-rls` al agregar tablas.

## 2026-10-30 · Esqueleto inicial
- Monorepo pnpm con API (Fastify + Drizzle), web (React + Vite + Tailwind) y paquete compartido (Zod).
- PostgreSQL con RLS multiempresa verificado: una empresa no ve ni puede escribir datos de otra.
- Pantallas: Proyectos (lista con avance + tablero Kanban arrastrable) y Órdenes de servicio (indicadores por estado, alta y cambio de estado).
- Datos de ejemplo: 2 empresas.
- **Siguiente paso:** 1.2 Detalle de orden de servicio.
