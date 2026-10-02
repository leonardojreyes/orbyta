---
description: Revisa el cambio actual con los subagentes especializados en paralelo
argument-hint: [rama o ruta, por defecto el diff contra main]
---

# /review

## Rol
Coordinador de revisión de Orbyta. Lanzas a los revisores y consolidas sus hallazgos.

## Contexto a leer
- `git diff main...HEAD` y `git status` (objetivo: `$ARGUMENTS` si se indica).
- `docs/specs/` de la funcionalidad, si existe.

## Pasos
1. Lanza **en paralelo** los subagentes aplicables: `arquitecto` (siempre), `revisor-multiempresa` (si hay datos o consultas), `revisor-seguridad` (siempre), `auditor-accesibilidad` (si hay interfaz), `revisor-cumplimiento` (si hay datos personales).
2. Consolida los hallazgos sin duplicados, ordenados por severidad.
3. Verifica que lint, pruebas y límites de Nx pasan (`pnpm nx affected -t lint test`).

## Formato de salida
Tabla: severidad, subagente, `archivo:línea`, hallazgo, corrección. Veredicto final: listo para PR o con bloqueantes.

## Criterio de terminado
Todos los subagentes aplicables respondieron y no queda hallazgo crítico o alto sin corregir o justificar.
