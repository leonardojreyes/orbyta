# Orbyta — gestión de proyectos y órdenes de servicio (SynapTech)

Plataforma multiempresa (web + móvil) para empresas de servicios. MVP liviano que crece a nivel corporativo.
Idioma: código y nombres técnicos en inglés; textos de UI, comentarios y docs en español.

## Stack (no cambiar sin ADR en docs/arquitectura.md)
- Monorepo pnpm · TypeScript estricto · Node 22
- `apps/api`: Fastify 5 + Drizzle ORM + PostgreSQL 16 (pg)
- `apps/web`: React 19 + Vite 7 + Tailwind 4 (sin librerías de UI pesadas)
- `packages/shared`: esquemas Zod y tipos compartidos (fuente única de validación)
- `apps/mobile` (fase 4): Expo + expo-sqlite para modo sin conexión

## Reglas no negociables
1. Toda tabla de negocio tiene `tenant_id`, PK `uuid`, `created_at`, `updated_at`, `deleted_at` y política RLS (ver `migrations/001_init.sql`).
2. Toda consulta de negocio pasa por `withTenant(req.tenantId, tx => …)`. Nunca filtrar por empresa "a mano" como única defensa.
3. Validar entradas con esquemas de `@orbyta/shared`; no duplicar tipos entre API y web.
4. Cambios de base de datos = nuevo archivo `apps/api/migrations/NNN_nombre.sql` + actualizar `src/db/schema.ts`. Nunca editar una migración ya aplicada.
5. Borrado lógico (`deleted_at`), nunca DELETE físico en datos de negocio.

## Comandos
- `pnpm install` · `pnpm db:migrate` · `pnpm db:seed` · `pnpm db:reset` · `pnpm typecheck`
- `pnpm dev` (API :3001 + web :5173) — lo corre Leonardo en otra terminal. **No lo ejecutes en primer plano**; para probar usa `curl -s localhost:3001/api/...` con header `X-Tenant-Id`.

## Restricciones del equipo (MacBook M1, 8 GB RAM, ~36 GB disco)
- Sin Docker, sin Xcode, sin Android Studio. PostgreSQL nativo (Homebrew).
- Antes de agregar una dependencia, justifica por qué no basta lo existente. Preferir librerías pequeñas.

## Forma de trabajo
- Una tarea por sesión. Al terminar: `pnpm typecheck`, actualizar `docs/progress.md` (usa `/avance`), commit.
- Para módulos nuevos usa la skill `nuevo-modulo`. Para revisar antes de commit usa el subagente `revisor`.
- Contexto adicional solo si la tarea lo requiere: `docs/arquitectura.md`, `docs/roadmap.md`, `docs/progress.md`.
