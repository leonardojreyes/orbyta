<!-- Presupuesto: máximo 80 líneas. Este archivo se carga en TODAS las sesiones.
     Antes de agregar algo aquí, revisa docs/guia-contexto.md ("Dónde va cada cosa").
     Los comentarios HTML como este no consumen tokens. -->
# orbyta — plataforma corporativa SynapTech

SaaS web multiempresa para corporaciones. Monolito modular con arquitectura hexagonal.
Detalle del producto: `docs/producto.md`. Mapa de la documentación: `docs/README.md`. Base técnica: `docs/fase0/base-tecnica.md`.

## Estado actual
@docs/estado.md

## Mapa del repositorio
- `apps/api` composición y entrada HTTP · `apps/web` SPA React + Vite
- `modules/<m>/` dominio, application, infrastructure, interface (cada módulo tiene su CLAUDE.md)
- `platform/<puerto>/` puertos transversales con adaptadores y prueba de contrato
- `packages/` contracts (OpenAPI), ui, tokens · `deploy/` Docker Compose · `docs/`

## Comandos
- `pnpm iniciar` prepara todo (idempotente; PostgreSQL 17 nativo debe estar corriendo)
- `pnpm dev --filter @orbyta/api|@orbyta/web` · `pnpm test --filter <paquete>` · `pnpm typecheck --filter <paquete>`
- `pnpm limites` valida la arquitectura · `pnpm lint` · `pnpm build`
- `pnpm recursos` mide RAM y disco · `pnpm contexto` mide el tamaño de estos archivos
- Variables en `.env.local` (bloqueado para Claude); plantilla en `.env.example`

## Reglas que aplican siempre
1. Un paso o una tarea a la vez; al terminar, reporta y espera "aprobado".
2. Diseña en modo plan antes de editar.
3. El dominio no importa frameworks, base de datos ni proveedores. Todo lo externo entra por un puerto.
4. Toda consulta corre con la empresa fijada; nunca uses un rol con BYPASSRLS.
5. Nunca: commits a main, secretos en código, licencias fuera de MIT/Apache/BSD/MPL sin ADR.
6. Pruebas, lint y tipos solo del paquete afectado. Máximo 2 servidores de desarrollo; detenlos al terminar.
7. Si falta información, pregunta. Si una decisión cambia la arquitectura, propón un ADR (`/adr`).
8. Antes de proponer cambios de arquitectura, lee el índice `docs/adr/README.md` y solo los ADR pertinentes.

## Flujo por funcionalidad
`/spec` → `/plan` → `/implement` (una tarea por sesión) → `/review` → PR. Al terminar la sesión: `/cerrar-sesion`.
