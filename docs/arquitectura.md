# Decisiones de arquitectura (ADR breves)

**ADR-01 · Monorepo TypeScript.** Un solo lenguaje en API, web y móvil; tipos y validaciones compartidos en `packages/shared`.

**ADR-02 · Multiempresa con RLS de PostgreSQL.** Columna `tenant_id` + políticas RLS con `FORCE`. La API fija `app.tenant_id` por transacción (`withTenant`). Aunque un desarrollador olvide un filtro, la base no devuelve datos de otra empresa. Evolución: esquema o base por cliente grande, sin cambiar el modelo.

**ADR-03 · Preparado para offline desde el día 1.** PK UUID generables en el cliente, `updated_at` y borrado lógico (`deleted_at`) en toda tabla de negocio → la sincronización de la fase 3 es incremental por `updated_at`.

**ADR-04 · Liviano para una Mac de 8 GB.** Sin Docker en desarrollo; PostgreSQL nativo; migraciones SQL planas con un migrador propio (sin herramientas extra); Fastify en vez de frameworks pesados.

**ADR-05 · Identidad diferida.** MVP usa header `X-Tenant-Id` (solo desarrollo). Fase 1.6: login propio. Fase 5: Keycloak (OIDC) sin cambiar `withTenant`: solo cambia de dónde sale el tenant.

**ADR-06 · Móvil con Expo.** Evita instalar Xcode (15–40 GB) y Android Studio; se prueba en el teléfono con Expo Go y se compila en la nube (EAS).
