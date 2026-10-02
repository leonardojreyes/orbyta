# ADR 022: Pipeline y controles de calidad en cada pull request

## Estado
Aceptado — Fase 0, paso 0.4 (2026-10-01)

## Contexto
La Fase 0 exige que ningún cambio llegue a `main` sin lint, tipos, pruebas, análisis de seguridad, licencias y compatibilidad del contrato. El repositorio es público (ver ADR 015), lo que permite la protección de ramas sin costo adicional.

## Decisión
Un workflow de GitHub Actions (`.github/workflows/ci.yml`) con un job por control, para que cada uno sea un control requerido de `main`:

| Job | Herramienta | Licencia |
| --- | --- | --- |
| `lint-tipos` | ESLint (Nx, límites por etiquetas), `tools/scripts/typecheck.mjs` (tsc), pruebas de hooks | MIT |
| `pruebas` | Jest con cobertura; umbral del 80 % en `domain` y `application` | MIT |
| `semgrep` | Semgrep CE + reglas propias en `.semgrep/orbyta.yml` | LGPL-2.1 (CLI, uso como herramienta) |
| `osv-scanner` | OSV-Scanner sobre `pnpm-lock.yaml` | Apache-2.0 |
| `licencias` | `tools/scripts/verificar-licencias.mjs` | propio |
| `gitleaks` | gitleaks sobre los commits del PR | MIT |
| `trivy` | Trivy sobre las imágenes de api, worker y web | Apache-2.0 |
| `sbom` | Trivy, formato CycloneDX, artefacto del workflow | Apache-2.0 |
| `contrato-openapi` | oasdiff (`breaking`, falla en cambios incompatibles) | Apache-2.0 |

Además: Dependabot (npm, github-actions, docker) semanal. Las acciones de terceros se fijan por SHA de commit. Los binarios (gitleaks, OSV-Scanner, oasdiff) se descargan con versión fija.

**Protección de `main`:** PR obligatorio, los nueve controles requeridos, una aprobación, ramas actualizadas antes de mergear y reglas **no aplicadas a administradores**. Con un único revisor humano (`leonardojreyes`), que además implementa, esto permite mergear con aprobación propia. Es un riesgo de autoaprobación aceptado y documentado en `docs/fase0/estado.md`.

**Licencias permitidas:** MIT, Apache-2.0, BSD-2/3, MPL-2.0 y las permisivas equivalentes ISC, 0BSD, MIT-0, Unlicense, CC0-1.0, CC-BY-4.0, BlueOak-1.0.0, Python-2.0 y WTFPL. Para expresiones `OR` basta una alternativa permitida.

### Excepciones de licencia
Registradas en `tools/licencias-excepciones.json`:
- `union` — no declara `license`, pero su archivo LICENSE es MIT (verificado).
- `@img/sharp-libvips-*` — LGPL-3.0-or-later. Binarios nativos sin modificar, enlazados dinámicamente por `sharp` (dependencia de Next.js); paquetes opcionales por plataforma (darwin, linux, linuxmusl).

### Vulnerabilidades corregidas y excepciones
El primer OSV-Scanner encontró 51 vulnerabilidades en 10 paquetes. Se corrigieron subiendo `next` a ~16.3.8 y con `overrides` en `pnpm-workspace.yaml` (axios, smol-toml, brace-expansion, esbuild). Quedan dos excepciones con vencimiento 2026-12-31 en `osv-scanner.toml`:
- `node-forge` 1.4.0 (GHSA-86w9-cpqp-85rv): solo herramienta de desarrollo de Expo, sin corrección publicada.
- `uuid` 7.x/8.x (GHSA-w5hq-g745-h8pq): transitiva de Expo/Metro; el uso vulnerable no aplica y la corrección es un cambio mayor.

## Alternativas consideradas
- **CodeQL:** gratuito para repos públicos, pero la regla del proyecto pide Semgrep CE; podría añadirse después.
- **gitleaks-action / trivy-action para todo:** el binario de gitleaks evita la acción oficial; se usa `trivy-action` solo donde simplifica.
- **`cyclonedx-npm` para el SBOM:** depende de `npm ls` y funciona mal con pnpm; Trivy lee `pnpm-lock.yaml`.
- **Rulesets de GitHub en lugar de protección de ramas clásica:** equivalentes; se usa la API clásica por simplicidad.

## Consecuencias
- Los Dockerfiles mínimos de `apps/api`, `apps/worker` y `apps/web` y el contrato `packages/contracts/openapi/openapi.yaml` son andamiaje para que Trivy y oasdiff tengan qué revisar; se vuelven reales en los pasos 0.6 y 0.8.
- `apps/web` pasa a `output: 'standalone'` para generar una imagen autocontenida.
- El runner autohospedado del paso 0.8 es un riesgo con repositorio público (un PR de un fork podría ejecutar código en él). Deberá limitarse a ramas propias, con aprobación para ejecutar workflows de forasteros.
- Pendiente de verificar: las imágenes Docker se construyen por primera vez en el CI (en la máquina de desarrollo Docker no pudo bajar la imagen base).
- Las pruebas de extremo a extremo completas quedan diferidas.

## Licencia
Herramientas listadas arriba; ninguna se redistribuye con el producto.
