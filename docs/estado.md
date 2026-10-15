**Fase:** 0 — Fundación · **Paso:** 0.4 en curso (queda 0.4.6b) · **Actualizado:** 2026-10-15

**En curso:** Paso 0.4 (plataforma transversal), plan en `~/.claude/plans/quizzical-chasing-kettle.md` (fuera del repo). Fusionadas: 0.4.1 identidad OIDC (#16), 0.4.2 RBAC (#17), 0.4.3 auditoría (#18), 0.4.4 logs JSON (#20), 0.4.5 cola pg-boss (#21), 0.4.6a puertos de archivos e IA (#22). `main` protegida con los 5 checks (`calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`).

**Próximo:** 0.4.6b — job de Keycloak en CI (realm como código en `deploy/keycloak/`, imagen fijada por digest), perfil `local` con `oauth2-mock-server` y prueba e2e de dos empresas con inicio de sesión. Verificar licencias y `minimumReleaseAge` de lo nuevo. Al cerrar 0.4: `revisor-seguridad` sobre el paso y pasar a 0.5.

**Pendientes y bloqueos:**
- Nadie da mantenimiento a pg-boss (expirar y archivar jobs): la app corre con `supervise: false`. Definir proceso con rol de migraciones antes de producción (0.6).
- Las tablas de pg-boss no tienen RLS: la carga solo lleva identificadores.
- pg-boss fijado en 12.37.0 (la 12.38.0 incumple `minimumReleaseAge`); subir cuando cumpla 7 días.
- El guard aún no consulta el `Autorizador`; se conecta con el primer endpoint con permisos.
- `detalle` de auditoría es libre: "sin datos personales" no se valida.
- El plan del 0.4 vive en `~/.claude/plans/`; moverlo a `docs/fase0/` si se trabaja desde otra máquina.
- El `GITHUB_TOKEN` del entorno devuelve 403 en protección de ramas; el del keyring sí funciona. Corregir permisos del token o usar el keyring.
- PRs de Dependabot #1–#5 (typescript 6, vite 8, @types/node 26, plugin-react 6, dependency-cruiser 18) desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,50 GB.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.
- El hook `.claude/hooks/antes-de-ejecutar.mjs` bloquea comandos que mencionan push y la rama principal aunque el push sea de otra rama (falso positivo): separar los comandos o afinar el patrón.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 008 (precisión): el outbox es el encolado transaccional en pg-boss (misma transacción del negocio); sin tabla outbox ni relevo.
- Logger JSON propio (sin pino) con `empresaId` y `requestId`; contexto por petición con `AsyncLocalStorage`.
- 014: licencias `Unlicense` y `CC-BY-4.0`; `busboy` y `streamsearch` como MIT; `semver@6.3.1` y `undici-types@6.21.0` excluidos de `trustPolicy`.

**Recursos medidos:** RAM total 8 GB (0,50 GB libres) · disco libre 44,5 GB · proyecto 0,26 GB · 0 servidores de desarrollo
