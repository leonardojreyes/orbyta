# Base técnica — orbyta

> Extraída de FASE0.md (sección 5) en el paso 0.1. Decisiones del arranque: backend TypeScript + NestJS, primer despliegue en nube privada, IA con Claude (ver `docs/adr/`).

### 1 Principios

| # | Principio | Cómo se hace cumplir |
| --- | --- | --- |
| P1 | Monolito modular; un módulo se separa solo con una razón medible | dependency-cruiser en CI |
| P2 | Arquitectura limpia (hexagonal): el dominio no conoce frameworks, base de datos ni proveedores | dependency-cruiser + subagente arquitecto |
| P3 | Multiempresa desde el día uno; el aislamiento lo garantiza la base de datos | RLS + prueba de aislamiento obligatoria por módulo |
| P4 | Contrato primero (OpenAPI 3.1) | Cliente generado + prueba de compatibilidad en CI |
| P5 | Estándares abiertos antes que productos | ADR para dependencias propietarias |
| P6 | Seguro por defecto: OWASP ASVS nivel 2 en autenticación, sesión y control de acceso; nivel 1 en el resto | Escaneos en cada PR |
| P7 | Privacidad conforme a la LOPDP | Clasificación de datos + revisión en `/plan` |
| P8 | Todo lo externo entra por un puerto; crecer es agregar un adaptador, no reescribir | Prueba de contrato por puerto |
| P9 | Decisiones escritas en ADRs | `docs/adr/` + `/adr` |
| P10 | Tecnología mayoritaria con soporte largo | Criterio en cada ADR de stack |

### 2 Stack y ADRs iniciales

| ADR | Decisión | Propuesta | Licencia |
| --- | --- | --- | --- |
| 001 | Estilo | Monolito modular + hexagonal por módulo | — |
| 002 | Backend | TypeScript + NestJS (Node.js LTS, compilador SWC) — elegido en 0.1 | MIT |
| 003 | Monorepo | pnpm workspaces + Turborepo; límites con dependency-cruiser | MIT |
| 004 | Web | React + Vite (SPA) + TanStack Router; móvil con React Native + Expo cuando llegue la primera funcionalidad móvil | MIT |
| 005 | Base de datos | PostgreSQL con RLS; migraciones versionadas | PostgreSQL |
| 006 | Identidad | La app solo valida tokens OIDC. `local`: oauth2-mock-server; `servidor`: Keycloak con realm como código, federable con Entra ID o Google Workspace del cliente | MIT / Apache 2.0 |
| 007 | Autorización | RBAC por empresa en PostgreSQL detrás de un puerto | — |
| 008 | Tareas y eventos | Outbox en PostgreSQL + pg-boss | MIT |
| 009 | IA | Puerto de IA + adaptador Anthropic (Claude) + adaptador simulado para pruebas | MIT |
| 010 | Despliegue | Imágenes OCI + Docker Compose en un servidor Linux de la nube privada; el mismo paquete se instala en el cliente | Apache 2.0 |
| 011 | CI/CD y seguridad | GitHub Actions: lint, tipos, pruebas, límites, Semgrep CE, OSV-Scanner (dependencias y licencias), gitleaks, Trivy | Varias abiertas |
| 012 | Entorno y perfiles | `mise.toml` con versiones fijadas, PostgreSQL nativo, perfiles `local`/`servidor`, `pnpm recursos` | MIT |
| 013 | Sistema de diseño | Tokens W3C + Style Dictionary, Tailwind + shadcn/ui, página de catálogo dentro de la app web | MIT / Apache 2.0 |

### 3 Multiempresa

- Por defecto **base compartida con RLS**; **base dedicada** o **instalación en el cliente** con el mismo código, por configuración.
- La empresa se resuelve en un solo lugar (claim del token OIDC) y viaja en el contexto de cada petición y tarea.
- Cada transacción fija la empresa (`SET LOCAL app.empresa_id`); sin empresa, la consulta falla. La app usa un rol sin `BYPASSRLS`.
- Archivos y tareas separados por empresa.
- Cada módulo trae una prueba que intenta leer datos de otra empresa y debe fallar, **contra PostgreSQL real**, en local y en CI.
- Configuración por empresa: logo y colores, módulos activos, proveedor de SSO.

### 4 Look and feel

Se define en el paso 0.5: referencias visuales, estilo y tono, colores, tipografía, densidad, claro u oscuro, marca por empresa. Ningún valor visual se escribe a mano: todo sale de los tokens. Contraste WCAG 2.2 AA verificado al aplicar colores de una empresa. Español de Ecuador, textos externalizados.

### 5 Context engineering

El repositorio arranca con el **kit de contexto** ya copiado (`CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`, `docs/` con índices y `scripts/contexto.mjs`). **No lo reescribas: complétalo y ajústalo** al stack elegido. Su diseño está en `docs/guia-contexto.md`; respeta la sección "Dónde va cada cosa" y los presupuestos de líneas.

- `CLAUDE.md` raíz: máximo 80 líneas; solo importa `docs/estado.md`.
- Reglas por ruta (`paths:`) para dominio, backend, datos y multiempresa, contratos, web, pruebas y docs.
- Cuatro subagentes: `arquitecto`, `revisor-seguridad`, `ingeniero-pruebas`, `revisor-ui`.
- Skills manuales (no ocupan contexto hasta invocarlas): `/spec`, `/plan`, `/implement`, `/review`, `/adr`, `/nueva-fase`, `/cerrar-sesion`, `/cerrar-fase`, `/recursos`. Skill automática: `crear-modulo`.
- `pnpm contexto` mide lo que se carga en cada sesión (meta: menos de 2.500 tokens) y falla si algo supera su presupuesto.

**Estructura del repositorio:**

```
<nombre>/
├── CLAUDE.md, FASE0.md, mise.toml, .env.example, .gitattributes
├── .claude/ (settings.json, rules/, agents/, skills/, hooks/)
├── apps/ (api, web)
├── modules/<modulo>/ (CLAUDE.md, domain, application, infrastructure, interface)
├── platform/<puerto>/ (port.ts, adapters/, contract.test.ts)
├── packages/ (contracts, ui, tokens)
├── scripts/ (recursos.mjs, iniciar.mjs, contexto.mjs)
├── deploy/ (Dockerfile, compose.yaml)
└── docs/ (README.md, estado.md, producto.md, glosario.md, guia-contexto.md, fase0/, adr/, fases/, specs/, security/)
```

**Hooks (Node, en `.claude/hooks/`):** antes de editar, bloquear `.env*` (salvo `.env.example`) y migraciones aplicadas; después de editar, Prettier y ESLint solo del archivo tocado; antes de ejecutar, bloquear comandos destructivos; al terminar, tipos y pruebas del paquete afectado y gitleaks.

**Permisos:** `deny` de lectura en `node_modules/`, `dist/`, `.turbo/`, `coverage/`, `.env.local`. `ask` para `docker`, `colima`, `ollama`, `ssh` y comandos sobre todo el monorepo.

### 6 Licencias

Preferir MIT, Apache 2.0, BSD o MPL. AGPL solo sin modificar y como servicio aparte. BSL, SSPL o "source-available" requieren ADR de excepción. El CI verifica licencias.
