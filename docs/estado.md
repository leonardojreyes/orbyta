**Fase:** 0 — Fundación · **Paso:** 0.5 en curso (tareas 1–2 de 11); 0.4 cerrado · **Actualizado:** 2026-10-17

**En curso:** nada abierto. Paso 0.5 Look and feel: spec, diseño y tareas en `docs/specs/look-and-feel/` (fusionados #26, #27). Hechas la tarea 1 (ADR 015, #28) y la 2 (contrato `/marca`, #29). `main` protegida con los 5 checks (`calidad`, `semgrep`, `osv`, `gitleaks`, `trivy`); el job `keycloak` corre pero no es requerido.

**Próximo:** tarea 3 de `docs/specs/look-and-feel/tareas.md`: tokens W3C, Style Dictionary, CSS claro/oscuro y fuente Inter autoalojada en `packages/tokens`. Con `/implement`, en modo plan. La 4 (lint de literales) es independiente de la 3.

**Pendientes y bloqueos:**
- Seguridad antes de producción (revisión del 0.4): exigir https y rechazar credenciales de desarrollo en `servidor`; verificar membresía usuario-empresa en BD; `Autorizador` en cada endpoint (el guard aún no lo consulta; `GET /marca` exige solo autenticación hasta entonces); `encolar` debe contrastar empresa con la transacción; registrar fallos de autenticación y límite de tasa; política LOPDP en `docs/security/` (0.6).
- Decidir si el job `keycloak` pasa a check requerido en `main`.
- pg-boss sin mantenimiento (`supervise: false`) y sin RLS: definir proceso con rol de migraciones antes de producción (0.6).
- Versiones fijadas por `minimumReleaseAge`: pg-boss 12.37.0 (12.38.0) y `oauth2-mock-server` 9.2.0 (9.3.0); subir cuando cumplan 7 días.
- `detalle` de auditoría es libre: "sin datos personales" no se valida.
- `GITHUB_TOKEN` del entorno devuelve 403 en PRs y protección de ramas; usar el del keyring (`env -u GITHUB_TOKEN gh ...`).
- PRs de Dependabot #1–#5 desfasados por `cooldown` y `minimumReleaseAge`: evaluar o cerrar.
- PostgreSQL 17 se arranca a mano con `pg_ctl`; RAM libre medida 0,11 GB: cerrar aplicaciones antes de abrir servidores.
- Un único revisor humano (Leonardo Reyes); clave de Claude diferida hasta el adaptador real de IA.
- Definir problema y usuarios en `docs/producto.md`.
- El hook `.claude/hooks/antes-de-ejecutar.mjs` bloquea comandos que mencionan push y la rama principal aunque el push sea de otra rama (falso positivo, se repitió en el 0.5): separar los comandos o afinar el patrón.
- `packages/contracts` valida el contrato solo al generar tipos (`openapi-typescript`); sin linter OpenAPI aparte. Evaluar Redocly si hace falta.

**Decisiones recientes** (las tres últimas; el resto en `docs/adr/README.md`):
- 015: `OFL-1.1` admitida solo para fuentes (Inter autoalojada vía `@fontsource-variable/inter`) y lista de dependencias visuales con licencia.
- Marca por empresa en módulo `marca`: logo solo PNG (≤256 KB), `GuardarMarca` sin ruta HTTP (script de carga y pruebas); color primario validado contra contraste AA.
- Contratos: tipos generados con `openapi-typescript` en `packages/contracts/src/api.d.ts` (versionado) y pruebas de contrato con `yaml`.

**Recursos medidos:** RAM total 8 GB (0,11 GB libres) · disco libre 43,1 GB · proyecto 0,29 GB · 0 servidores de desarrollo
