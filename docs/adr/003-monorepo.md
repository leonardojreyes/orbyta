# ADR 003: Monorepo — Nx + pnpm

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta tiene múltiples desplegables (api, worker, web, mobile) y paquetes compartidos (contracts, ui, tokens) que deben evolucionar juntos, con reglas de límites entre módulos (ADR 001) verificadas automáticamente, y debe funcionar igual en Windows y macOS.

## Decisión
Monorepo gestionado con **Nx** y **pnpm** como gestor de paquetes. Nx aporta grafo de dependencias, `nx affected` para pruebas/builds incrementales y reglas de límites de módulos (`@nx/enforce-module-boundaries`) que hacen fallar el lint ante una importación prohibida (p. ej. dominio importando infraestructura).

## Alternativas consideradas
- **Turborepo:** más simple, pero con reglas de límites de arquitectura menos maduras que Nx para este caso de uso.
- **Múltiples repositorios:** evita el monorepo, pero complica compartir `contracts`, `ui` y `tokens` entre api/web/mobile, y el versionado cruzado alargaría el plazo de Fase 0.

## Consecuencias
- Un solo `pnpm install` deja todo el entorno listo.
- Los scripts de ciclo de vida (`build`, `test`, `lint`) viven en `package.json`/Nx, nunca en bash, para funcionar igual en Windows y macOS (regla 3.7).
- El pipeline de CI (paso 0.4) usa `nx affected` para no ejecutar todo el monorepo en cada PR.

## Licencia
Nx (núcleo) y pnpm son MIT.
