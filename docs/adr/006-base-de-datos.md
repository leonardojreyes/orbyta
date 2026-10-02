# ADR 006: Base de datos — PostgreSQL con RLS; CloudNativePG en Kubernetes

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta es multiempresa desde el día uno (sección 5.4), con despliegue on-premise en Kubernetes (ADR 011) y requiere aislamiento garantizado entre empresas sin duplicar esquemas ni bases por cliente en esta versión.

## Decisión
**PostgreSQL** como base de datos relacional, con **Row-Level Security (RLS)** para aislar filas por empresa (`app.tenant_id` fijado con `SET LOCAL` en cada transacción), operado en Kubernetes con el operador **CloudNativePG**. Modo compartido: misma base de datos, filas separadas por empresa; base dedicada por empresa queda diferida.

## Alternativas consideradas
- **Una base de datos por empresa:** aislamiento más fuerte, pero multiplica el costo operativo (migraciones, backups, conexiones) para un número de empresas aún no determinado; se deja como opción diferida si una empresa lo exige contractualmente.
- **Aislamiento solo a nivel de aplicación (sin RLS):** más simple de implementar, pero un error de programación podría filtrar datos entre empresas sin que la base de datos lo impida; incompatible con el principio de seguridad por defecto (sección 5.2.6).

## Consecuencias
- El rol de la aplicación no tiene `BYPASSRLS` ni es dueño de las tablas; las migraciones usan un rol distinto (sección 5.4).
- Toda consulta sin empresa en contexto falla por diseño.
- Cada módulo debe traer pruebas de aislamiento (leer/listar/modificar datos de otra empresa deben fallar), verificadas en el paso 0.6.

## Licencia
PostgreSQL: licencia PostgreSQL (estilo MIT/BSD). CloudNativePG: Apache 2.0.
