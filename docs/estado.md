**Fase:** 0 — Fundación · **Paso:** 0.5 en curso (tareas 1–5 de 11); 0.4 cerrado · **Actualizado:** 2026-10-17

**En curso:** nada abierto. Paso 0.5 Look and feel: spec, diseño y tareas en `docs/specs/look-and-feel/` (fusionados #26, #27). Hechas la tarea 1 (ADR 015, #28), la 2 (contrato `/marca`, #29), la 3 (tokens, #31), la 4 (lint de literales, #33) y la 5 (módulo `marca`: dominio y casos de uso en memoria, #35). `main` protegida con los 5 checks (`calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`); el job `keycloak` corre pero no es requerido.

**Próximo:** tarea 6 de `docs/specs/look-and-feel/tareas.md`: `marca` con migración `001_marca.sql`, `RepositorioMarcaPostgres` y `aislamiento.test.ts` contra PostgreSQL real. Con `/implement`, en modo plan. Parte de `origin/main`. Incluye los hallazgos de la revisión de #35: `MarcaEmpresa.reconstruir` (no validar contraste al leer de BD), `GuardarMarca` con borrados de mejor esfuerzo y sin que la limpieza tape el error original, y lectura-escritura de la marca con `FOR UPDATE` o versión.

**Pendientes y bloqueos:**
- Seguridad antes de producción (revisión del 0.4): exigir https y rechazar credenciales de desarrollo en `servidor`; verificar membresía usuario-empresa en BD; `Autorizador` en cada endpoint (el guard aún no lo consulta; `GET /marca` exige solo autenticación hasta entonces); `encolar` debe contrastar empresa con la transacción; registrar fallos de autenticación y límite de tasa; política LOPDP en `docs/security/` (0.6).
- Tarea 7 (`apps/api`): `empresaId` solo de la sesión y permiso de administrador para guardar marca; `/marca/logo` con `Content-Type: image/png`, `nosniff` y límite del cuerpo; prueba cruzada del color predeterminado con el token.
- `modules/marca/CLAUDE.md` dice "fondo de cada tema"; debe decir fondo claro (el oscuro usa su primario aclarado). `RepositorioMarcaMemoria` se exporta del índice; moverlo a una subruta de pruebas. Alinear el criterio 4 de `requisitos.md`.
- Decidir si el job `keycloak` pasa a check requerido en `main`.
- pg-boss sin mantenimiento (`supervise: false`) y sin RLS: definir proceso con rol de migraciones antes de producción (0.6).
- Versiones fijadas por `minimumReleaseAge`: pg-boss 12.37.0 (12.38.0) y `oauth2-mock-server` 9.2.0 (9.3.0); subir cuando cumplan 7 días.
- `detalle` de auditoría es libre: "sin datos personales" no se valida.
- `GITHUB_TOKEN` del entorno devuelve 403 en PRs y protección de ramas; usar el del keyring (`env -u GITHUB_TOKEN gh ...`).
- PRs de Dependabot #1–#5 desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; cerrar aplicaciones antes de abrir servidores.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.
- El hook `.claude/hooks/antes-de-ejecutar.mjs` bloquea comandos que mencionan push y la rama principal aunque el push sea de otra rama (falso positivo): separar los comandos o afinar el patrón.
- `gh pr merge` lo bloquea el clasificador de permisos de Claude ("fusión sin revisión"): fusionar en el navegador o con `! env -u GITHUB_TOKEN gh pr merge <n> --squash --delete-branch`.
- `packages/contracts` valida el contrato solo al generar tipos (`openapi-typescript`); sin linter OpenAPI aparte. Evaluar Redocly si hace falta.
- `packages/tokens`: `dist/` está bloqueado para lectura por permisos; la prueba de contraste valida el CSS generado. `osv-scanner` solo corre en CI.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- Contraste de marca: el color de empresa se valida solo en el tema claro (texto blanco ≥4,5:1, primario ≥3:1); el oscuro usa su primario aclarado, porque `#1d4ed8` da 2,82:1 sobre `#0f1115`. Anotado en `diseno.md`.
- Lint de literales: `react/jsx-no-literals` (`ignoreProps`, permite `orbyta`) y `no-restricted-syntax` para colores, tamaños, `style` y texto en atributos visibles, solo en `apps/web` y `packages/ui`; prueba en `scripts/lint-literales.test.mjs` (`pnpm probar:lint`, en CI). ESLint no revisa CSS.
- Tokens: JSON W3C + Style Dictionary 5 con formatos propios (`construir.mjs`); `src/generado/temas.ts` no se versiona; el tema oscuro vive en `[data-tema="oscuro"]`; `colorPrimarioPredeterminado` = `#1d4ed8`.

**Recursos medidos:** RAM total 8 GB (0,12 GB libres) · disco libre 42,9 GB · proyecto 0,36 GB · 0 servidores de desarrollo
