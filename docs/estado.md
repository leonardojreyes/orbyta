**Fase:** 0 — Fundación · **Paso:** 0.4 en curso (3 de 6 tareas) · **Actualizado:** 2026-10-15

**En curso:** Paso 0.4 (plataforma transversal), plan aprobado en `~/.claude/plans/quizzical-chasing-kettle.md`. Hechas y fusionadas: 0.4.1 identidad OIDC + contexto de empresa (#16), 0.4.2 RBAC (#17), 0.4.3 auditoría append-only (#18). `main` protegida con los 5 checks (`calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`) y 0 aprobaciones.

**Próximo:** 0.4.4 logs JSON con `empresaId` y `requestId` desde `apps/api/src/contexto.ts` (sin datos personales). Luego 0.4.5 outbox + pg-boss y 0.4.6 archivos, IA y Keycloak en CI. Una tarea por PR; esperar "aprobado".

**Pendientes y bloqueos:**
- 0.4.6: perfil `local` con `oauth2-mock-server` y job de Keycloak en CI (hoy la identidad solo se prueba con claves en memoria).
- El guard aún no consulta el `Autorizador`; se conecta con el primer endpoint con permisos.
- `detalle` de auditoría es libre: "sin datos personales" no se valida; revisar con `revisor-seguridad` al cerrar 0.4.
- El `GITHUB_TOKEN` del entorno devuelve 403 en protección de ramas; el del keyring sí funciona. Corregir permisos del token o usar el keyring.
- PRs de Dependabot #1–#5 (typescript 6, vite 8, @types/node 26, plugin-react 6, dependency-cruiser 18) desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,08 GB.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.
- El hook `.claude/hooks/antes-de-ejecutar.mjs` bloquea comandos que mencionan push y la rama principal aunque el push sea de otra rama (falso positivo): separar los comandos o afinar el patrón.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 014: licencias `Unlicense` y `CC-BY-4.0`; `busboy` y `streamsearch` como MIT; `semver@6.3.1` y `undici-types@6.21.0` excluidos de `trustPolicy`.
- 011: `main` protegida con PR y checks, sin aprobación obligatoria (un revisor).
- Repo de GitHub público mientras se desarrolla (cuenta Free); `minimumReleaseAge` de 7 días y vitest 4.

**Recursos medidos:** RAM total 8 GB (0,08 GB libres) · disco libre 43,5 GB · proyecto 0,25 GB · 0 servidores de desarrollo
