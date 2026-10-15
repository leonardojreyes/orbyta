**Fase:** 0 — Fundación · **Paso:** 0.3 en curso · **Actualizado:** 2026-10-14

**En curso:** Paso 0.3 (pipeline). PR #6 (`chore/fundacion` → `main`) con los 5 checks en verde: `calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`. `main` aún **sin protección** y PR #6 sin fusionar.

**Próximo:** (1) proteger `main` con esos 5 checks y 0 aprobaciones, usando el token del keyring (`env -u GITHUB_TOKEN gh api -X PUT repos/leonardojreyes/orbyta/branches/main/protection`); (2) fusionar PR #6; (3) PR violador que deba bloquearse; (4) cerrar 0.3 y pasar a 0.4.

**Pendientes y bloqueos:**
- El `GITHUB_TOKEN` del entorno devuelve 403 en protección de ramas; el del keyring sí funciona. Corregir permisos del token o usar el keyring.
- `apps/api` y `apps/web` versionan `tsconfig.tsbuildinfo` (cambia en cada typecheck): sacarlos del repo y añadirlos a `.gitignore`.
- PRs de Dependabot #1–#5 (typescript 6, vite 8, @types/node 26, plugin-react 6, dependency-cruiser 18) desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,37 GB.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 014: licencias `Unlicense` y `CC-BY-4.0`; `busboy` y `streamsearch` como MIT; `semver@6.3.1` y `undici-types@6.21.0` excluidos de `trustPolicy`.
- 011: `main` protegida con PR y checks, sin aprobación obligatoria (un revisor).
- Repo de GitHub público mientras se desarrolla (cuenta Free); `minimumReleaseAge` de 7 días y vitest 4.

**Recursos medidos:** RAM total 8 GB (0,37 GB libres) · disco libre 44,5 GB · proyecto 0,25 GB · 0 servidores de desarrollo
