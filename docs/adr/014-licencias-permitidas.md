# 014 — Licencias y excepciones de confianza

**Estado:** Aceptado · **Fecha:** 2026-10-14

## Contexto
El primer CI real (PR #6) rechazó cuatro paquetes transitivos por licencia: `isbot` (Unlicense), `caniuse-lite` (CC-BY-4.0), `busboy` y `streamsearch` (metadato ausente; ambos son MIT).
Al endurecer pnpm (`trustPolicy: no-downgrade`), dos versiones antiguas fueron marcadas como bajada de confianza de publicación: `semver@6.3.1` y `undici-types@6.21.0`.

## Decisión
- Se añaden `Unlicense` (dominio público, más permisiva que MIT) y `CC-BY-4.0` (solo datos, sin código enlazado) a la lista de OSV-Scanner.
- `busboy` y `streamsearch` se declaran MIT con `PackageOverrides` en `osv-scanner.toml`.
- `semver@6.3.1` y `undici-types@6.21.0` se excluyen con `trustPolicyExclude` en `pnpm-workspace.yaml`, por versión exacta; la política sigue activa para el resto.
- Toda licencia o excepción nueva requiere un ADR.

## Alternativas consideradas
- Desactivar la verificación de licencias o la política de confianza: pierde el control exigido por la regla 5 y por Semgrep.
- Reemplazar o subir los paquetes: sin ganancia real y con riesgo de compatibilidad con `@types/node@22`.

## Consecuencias
- Lista vigente: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, MPL-2.0, PostgreSQL, 0BSD, BlueOak-1.0.0, CC0-1.0, Python-2.0, Unlicense, CC-BY-4.0.
- Las exclusiones de confianza dejan de aplicar si cambia la versión: se reevalúan en cada actualización.
- Complementa el ADR 011.
