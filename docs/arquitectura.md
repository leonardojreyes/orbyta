# Decisiones de arquitectura (ADR breves)

**ADR-01 · Monorepo TypeScript.** Un solo lenguaje en API, web y móvil; tipos y validaciones compartidos en `packages/shared`.

**ADR-02 · Multiempresa con RLS de PostgreSQL.** Columna `tenant_id` + políticas RLS con `FORCE`. La API fija `app.tenant_id` por transacción (`withTenant`). Aunque un desarrollador olvide un filtro, la base no devuelve datos de otra empresa. Evolución: esquema o base por cliente grande, sin cambiar el modelo.

**ADR-03 · Preparado para offline desde el día 1.** PK UUID generables en el cliente, `updated_at` y borrado lógico (`deleted_at`) en toda tabla de negocio → la sincronización de la fase 3 es incremental por `updated_at`.

**ADR-04 · Liviano para una Mac de 8 GB.** Sin Docker en desarrollo; PostgreSQL nativo; migraciones SQL planas con un migrador propio (sin herramientas extra); Fastify en vez de frameworks pesados.

**ADR-05 · Identidad.** Desde 1.6: login propio (código de empresa + correo + contraseña), contraseñas con scrypt (`node:crypto`), sesión en cookie HttpOnly `<tenantId>.<secreto>` (en BD solo el SHA-256 del secreto; el tenantId del token permite buscar la sesión pasando por RLS). La empresa y el usuario salen de la sesión; no existe el header `X-Tenant-Id`. Roles: `admin` (todo y usuarios), `supervisor` (operación, sin usuarios ni edición de empresa), `technician` (solo sus órdenes y su estado, según `users.technician_id`). Fase 5: Keycloak (OIDC) sin cambiar `withTenant`: solo cambia de dónde sale el tenant y el rol.

**ADR-06 · Móvil con Expo.** Evita instalar Xcode (15–40 GB) y Android Studio; se prueba en el teléfono con Expo Go y se compila en la nube (EAS).

**ADR-07 · Dos roles de base de datos.** La API usa `orbyta_app` (`DATABASE_URL`): sin superusuario ni `BYPASSRLS`, solo SELECT/INSERT/UPDATE, sin DELETE ni DDL. Migraciones y seed usan el dueño del esquema (`DATABASE_ADMIN_URL`). Con un superusuario RLS no filtra nada; `pnpm --filter @orbyta/api db:check-rls` lo verifica y debe correrse al agregar tablas.

**ADR-08 · `tenants` y el logo.** `tenants` es la tabla raíz: sin `tenant_id` ni RLS. `GET/PATCH /company` filtran siempre por la empresa de la solicitud (`req.tenantId`), nunca por un id enviado por el cliente. Esa empresa sale de la sesión (1.6), por lo que ya no se puede editar otra empresa; solo `admin` puede modificar sus datos. El logo se guarda como data URL (png, jpeg, webp o svg, máx. ~200 KB) en `tenants.logo_url` para no depender de almacenamiento de archivos (llega con adjuntos, fase 2). Solo debe renderizarse con `<img>`, nunca abrirse directo ni con `<object>`/`<iframe>` (un SVG podría traer scripts).

**ADR-09 · Límites conocidos de la autenticación local.** Límite de intentos de login en memoria (un solo proceso; con varios servidores pasa a BD o Redis). Sesión fija de 7 días, sin renovación. Sin recuperación de contraseña por correo (la restablece un admin). Cookie `Secure` solo con `NODE_ENV=production`: en un servidor hay que servir por HTTPS.
