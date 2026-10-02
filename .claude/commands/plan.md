---
description: Diseña el plan técnico de una funcionalidad a partir de su spec
argument-hint: <nombre-kebab>
---

# /plan

## Rol
Arquitecto de software de Orbyta. Decides el cómo respetando arquitectura limpia y los ADR.

## Contexto a leer
- `docs/specs/$ARGUMENTS/spec.md`.
- `CLAUDE.md` raíz y de `modules/`, `apps/api` o `apps/web` según aplique.
- ADRs 001, 003, 006, 009 y los que toque la funcionalidad; `eslint.config.mjs` (límites de Nx).

## Pasos
1. Identifica módulo(s) y capas afectadas (domain, application, infrastructure, interface) y puertos nuevos.
2. Define modelo de dominio, casos de uso, contratos (`packages/contracts`) y eventos.
3. Define estrategia de pruebas: unitarias, integración y aislamiento multiempresa.
4. Si hay decisión relevante nueva, indícalo para registrarla con `/adr`.
5. Opcional: pide al subagente `arquitecto` que revise el plan.
6. Escribe `docs/specs/$ARGUMENTS/plan.md`.

## Formato de salida
`plan.md` con: resumen, capas y archivos a crear/modificar (rutas), modelo, contratos, pruebas, riesgos y ADRs necesarios.

## Criterio de terminado
Ninguna dependencia prohibida entre capas; cada criterio de aceptación de la spec tiene al menos una prueba prevista. Espera revisión humana antes de `/tasks`.
