# Avance

## 2026-10-30 · 1.5 Logo y datos de empresa
- Migración `005_company_profile.sql`: RUC, dirección, teléfono, correo y `updated_at` en `tenants`. El logo va como data URL (máx. ~200 KB) en `logo_url`, sin dependencias nuevas.
- API: `GET/PATCH /company` filtran siempre por la empresa de la solicitud; `/tenants` ya no devuelve logo ni datos fiscales.
- Web: vista "Empresa" (datos y logo: subir, cambiar, quitar) y logo y nombre de la empresa activa en la barra lateral. Los errores de validación indican los campos que fallaron.
- Decisiones: `tenants` sigue sin RLS (tabla raíz), con la brecha del header hasta 1.6; el logo solo se renderiza con `<img>`. Ambas quedan en `docs/arquitectura.md` (ADR-07 y ADR-08, que también recoge el rol `orbyta_app`).
- Revisor: sin fallos de reglas. Corregido: error de lectura del archivo sin manejar, y el formulario ya no reenvía un logo sin cambios. Sin hacer: `loadCompany` ignora errores en silencio. Probado con curl; pantallas sin ver en el navegador.
- **Siguiente paso:** 1.6 Autenticación local (usuarios, login, roles admin/supervisor/técnico); la empresa sale de la sesión y deja de venir del header.

## 2026-10-30 · 1.4 Órdenes vinculadas a proyectos
- Migración `004_order_project_fk.sql`: la FK de `project_id` pasa a ser compuesta `(tenant_id, id)`, como cliente y técnico; una orden no puede apuntar a un proyecto de otra empresa.
- API: las órdenes validan el proyecto (400 si no existe); nuevo `GET /projects/:id/service-orders` (404 si el proyecto no existe) y `orderCount` en `GET /projects`.
- Web: selector de proyecto en el alta y en el panel de la orden, columna "Proyecto" en la tabla, y en cada proyecto la lista de sus órdenes con conteo por estado, vincular una orden existente y desvincular.
- `db:check-rls` suma la comprobación del proyecto de otra empresa (20 comprobaciones). Probado con curl; las pantallas aún no se han visto en el navegador.
- **Revisor:** sin fallos de reglas. Corregido en un commit aparte: respuesta obsoleta al cambiar de proyecto y pruebas cruzadas de `db:check-rls` que pasaban por casualidad. Sin hacer: la lista de órdenes sin proyecto se filtra en el cliente (no escala), y una orden con proyecto borrado lógicamente muestra "—" en la tabla. La base local se sembró antes de 1.4, así que OS-0001 de Aguas no está vinculada a PRY-001 (el seed nuevo sí la vincula).
- **Siguiente paso:** 1.5 Logo por empresa y datos de empresa.

## 2026-10-30 · 1.3 Catálogos de clientes y técnicos
- Migración `003_catalogs.sql`: `customers` y `technicians` con RLS; las órdenes tienen `customer_id` y `technician_id` con llave foránea compuesta `(tenant_id, id)`, que impide referenciar datos de otra empresa. Catálogos iniciales creados desde las órdenes existentes.
- API: GET/POST/PATCH de `/customers` y `/technicians`. Las órdenes validan que cliente y técnico existan (400) y copian su nombre a `customer_name` / `assigned_to`. Un técnico inactivo no se puede asignar, pero no bloquea editar órdenes que ya lo tenían.
- Web: vistas Clientes y Técnicos (alta y edición), y selectores de cliente y técnico en el alta de orden y en el panel de detalle.
- Seed con catálogos, órdenes vinculadas y evento "creada" (corrige el hueco de 1.2 tras `db:reset`). `db:check-rls` ahora cubre las tablas nuevas (19 comprobaciones) y sus pruebas de escritura siempre se revierten. `.env.*` ignorado salvo `.env.example`.
- **Pendiente menor:** no hay acción de borrado lógico en la UI de catálogos ni estado para desactivar clientes; el backfill de clientes une los que tengan el mismo nombre.
- **Siguiente paso:** 1.4 Vincular órdenes a proyectos y ver órdenes dentro del proyecto.

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
