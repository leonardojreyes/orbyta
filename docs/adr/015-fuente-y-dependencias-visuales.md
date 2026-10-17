# 015 — Fuente y dependencias visuales

**Estado:** Aceptado · **Fecha:** 2026-10-17

## Contexto
El paso 0.5 (look and feel) necesita una fuente abierta autoalojada y varias dependencias nuevas. La fuente Inter usa SIL OFL-1.1, que no está en la lista vigente (ADR 014) ni en la regla 5. El ADR 013 declaraba "MIT / Apache 2.0" para el sistema de diseño.

## Decisión
- Admitir `OFL-1.1` solo para fuentes tipográficas. Se añade a `--licenses` de OSV-Scanner en `.github/workflows/ci.yml`.
- Servir Inter desde `@fontsource-variable/inter`, autoalojada, sin CDN.
- Admitir estas dependencias visuales; cada versión se fija al instalarla, respetando `minimumReleaseAge`:

| Dependencia | Licencia |
| --- | --- |
| Tailwind CSS | MIT |
| Style Dictionary | Apache-2.0 |
| shadcn/ui y Radix UI | MIT |
| TanStack Router (ya presente) | MIT |
| axe-core | MPL-2.0 |
| jsdom, Testing Library | MIT |
| eslint-plugin-react | MIT |
| Inter (`@fontsource-variable/inter`) | OFL-1.1 |

## Alternativas consideradas
- Fuente del sistema: sin ADR, pero la marca pierde consistencia entre equipos.
- Servir Inter desde un CDN: viola el criterio 10 (sin peticiones externas).

## Consecuencias
- OFL-1.1 se permite solo para fuentes; otro uso requiere un ADR nuevo.
- Complementa 013 y 014.
- Al instalar cada dependencia se verifica su licencia real y las transitivas con `osv-scanner`; si difiere de la tabla, se corrige este ADR.
