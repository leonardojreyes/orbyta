<!-- Una línea por ADR. Claude lee este índice y abre solo los ADR pertinentes. -->
# Decisiones de arquitectura

| ADR | Decisión | Estado |
| --- | --- | --- |
| [001](001-estilo-arquitectonico.md) | Monolito modular + hexagonal por módulo | Aceptado |
| [002](002-backend-typescript-nestjs.md) | Backend en TypeScript + NestJS (Node.js LTS, compilador SWC) | Aceptado |
| [003](003-monorepo-pnpm-turborepo.md) | pnpm workspaces + Turborepo | Aceptado |
| [004](004-web-react-vite.md) | React + Vite (SPA) + TanStack Router | Aceptado |
| [005](005-base-datos-postgresql-rls.md) | PostgreSQL con RLS y migraciones versionadas | Aceptado |
| [006](006-identidad-oidc.md) | La app solo valida tokens OIDC | Aceptado |
| [007](007-autorizacion-rbac.md) | RBAC por empresa en PostgreSQL detrás de un puerto | Aceptado |
| [008](008-tareas-eventos-outbox-pgboss.md) | Outbox en PostgreSQL + pg-boss | Aceptado |
| [009](009-ia-puerto-claude.md) | Puerto de IA con adaptador Anthropic (Claude) y adaptador simulado | Aceptado |
| [010](010-despliegue-oci-compose-nube-privada.md) | Imágenes OCI + Docker Compose en nube privada | Aceptado |
| [011](011-cicd-seguridad.md) | GitHub Actions con controles de calidad y seguridad | Aceptado |
| [012](012-entorno-perfiles.md) | mise.toml, PostgreSQL nativo y perfiles local/servidor | Aceptado |
| [013](013-sistema-diseno.md) | Tokens W3C + Style Dictionary, Tailwind + shadcn/ui | Aceptado |
