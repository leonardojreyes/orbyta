---
name: nuevo-modulo
description: Crea un módulo de negocio completo en Orbyta (tabla + RLS + esquema Zod + rutas API + vista web) siguiendo el patrón de service_orders. Usar cuando se pida agregar una entidad nueva (p. ej. clientes, técnicos, materiales).
---
# Crear un módulo de negocio

Patrón de referencia: órdenes de servicio. Copia su forma, no inventes otra.

1. **Migración** `apps/api/migrations/NNN_<entidad>.sql` (siguiente número):
   - `id uuid PK default gen_random_uuid()`, `tenant_id uuid not null references tenants(id)`, columnas de negocio, `created_at`, `updated_at`, `deleted_at`.
   - CHECK para estados. Índice `(tenant_id, …)` para los filtros habituales.
   - `ENABLE` + `FORCE ROW LEVEL SECURITY` y política `tenant_isolation` idéntica a la de `001_init.sql`.
2. **Drizzle**: agrega la tabla a `apps/api/src/db/schema.ts` reutilizando `timestamps`.
3. **Zod** en `packages/shared/src/index.ts`: `<Entidad>Create`, `<Entidad>Update = Create.partial().omit({id:true})`, interfaz de respuesta, catálogos de estado y etiquetas en `LABELS`.
4. **Rutas** `apps/api/src/routes/<entidad>.ts` (GET lista, POST, PATCH) usando `withTenant`; regístralas en `server.ts` dentro del bloque `scoped`.
5. **Vista** `apps/web/src/views/<Entidad>View.tsx` usando `api/post/patch` y componentes de `ui.tsx`; agrega la entrada al menú en `App.tsx`.
6. **Verifica**: `pnpm db:migrate`, `pnpm typecheck`, y un `curl -s -H "X-Tenant-Id: <uuid>" localhost:3001/api/<ruta>`.
7. Llama al subagente `revisor`, corrige lo ALTO, y ejecuta `/avance`.
