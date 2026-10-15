**Fase:** 0 — Fundación · **Paso:** 0.4 cerrado; 0.5 sin empezar · **Actualizado:** 2026-10-15

**En curso:** nada (PR de cierre #25 pendiente de fusión). Paso 0.4 fusionado (#16–#24): identidad OIDC, RBAC, auditoría, logs JSON, cola pg-boss, puertos de archivos e IA, Keycloak en CI y e2e de dos empresas. `main` protegida con los 5 checks (`calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`); el job `keycloak` corre en cada PR pero no es requerido.

**Próximo:** 0.5 Look and feel (`FASE0.md` §5.4): empezar con `/spec` y las preguntas de la sección 5.4, en modo plan.

**Pendientes y bloqueos:**
- Seguridad antes de producción (revisión del 0.4): exigir https y rechazar credenciales de desarrollo en `servidor`; verificar membresía usuario-empresa en BD; `Autorizador` en cada endpoint (el guard aún no lo consulta); `encolar` debe contrastar empresa con la transacción; registrar fallos de autenticación y límite de tasa; política LOPDP en `docs/security/` (0.6).
- Decidir si el job `keycloak` pasa a check requerido en `main`.
- pg-boss sin mantenimiento (`supervise: false`) y sin RLS: definir proceso con rol de migraciones antes de producción (0.6); la carga solo lleva identificadores.
- Versiones fijadas por `minimumReleaseAge`: pg-boss 12.37.0 (12.38.0) y `oauth2-mock-server` 9.2.0 (9.3.0); subir cuando cumplan 7 días.
- `detalle` de auditoría es libre: "sin datos personales" no se valida.
- `GITHUB_TOKEN` del entorno devuelve 403 en PRs y protección de ramas; usar el del keyring (`env -u GITHUB_TOKEN gh ...`).
- PRs de Dependabot #1–#5 (typescript 6, vite 8, @types/node 26, plugin-react 6, dependency-cruiser 18) desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,12 GB: cerrar aplicaciones antes de abrir servidores.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.
- El hook `.claude/hooks/antes-de-ejecutar.mjs` bloquea comandos que mencionan push y la rama principal aunque el push sea de otra rama (falso positivo): separar los comandos o afinar el patrón.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 006 (precisión): claims `sub`, `empresa_id`, `roles`, `aud=orbyta-api`; el realm de `deploy/keycloak/` es solo para CI, con `empresa_id` editable solo por admin y password grant en un cliente aparte (`orbyta-e2e`).
- 008 (precisión): el outbox es el encolado transaccional en pg-boss (misma transacción del negocio); sin tabla outbox ni relevo.
- Logger JSON propio (sin pino) con `empresaId` y `requestId`; contexto por petición con `AsyncLocalStorage`.

**Recursos medidos:** RAM total 8 GB (0,12 GB libres) · disco libre 44,3 GB · proyecto 0,27 GB · 0 servidores de desarrollo
