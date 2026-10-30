# Avance

## 2026-10-30 · 1.2 Detalle de orden de servicio
- Migración `002_service_order_events.sql`: historial de estados por orden (con RLS) y evento "creada" para las órdenes existentes.
- API: `PATCH /service-orders/:id` registra el cambio de estado en la misma transacción (con `FOR UPDATE`); nuevo `GET /service-orders/:id/events` (404 si la orden no existe).
- Web: panel lateral (`OrderPanel.tsx`) al hacer clic en una orden: edita cliente, dirección, falla, prioridad, estado y técnico, y muestra el historial.
- `OrderUpdate.assignedTo` acepta `null` para poder quitar al técnico.
- **Problema abierto (previo a este paso):** la API se conecta con el rol `leo`, superusuario con `bypassrls`, así que RLS no filtra nada. Con `X-Tenant-Id` de una empresa se pudo leer y modificar datos de la otra. Lo de "RLS verificado" en la entrada anterior no es válido con esta conexión. Pendiente de decisión: crear un rol `orbyta_app` sin superusuario ni `bypassrls`, apuntar `DATABASE_URL` a él y añadir una prueba de aislamiento.
- **Siguiente paso:** corregir el aislamiento (rol `orbyta_app`) antes de 1.3 Catálogos de clientes y técnicos.

## 2026-10-30 · Esqueleto inicial
- Monorepo pnpm con API (Fastify + Drizzle), web (React + Vite + Tailwind) y paquete compartido (Zod).
- PostgreSQL con RLS multiempresa verificado: una empresa no ve ni puede escribir datos de otra.
- Pantallas: Proyectos (lista con avance + tablero Kanban arrastrable) y Órdenes de servicio (indicadores por estado, alta y cambio de estado).
- Datos de ejemplo: 2 empresas.
- **Siguiente paso:** 1.2 Detalle de orden de servicio.
