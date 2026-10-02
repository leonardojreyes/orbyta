# Tareas: ping

Spec: [`spec.md`](./spec.md) · Plan: [`plan.md`](./plan.md). Una tarea por sesión, pruebas primero.

- [x] **T1 — Scaffolding de las cuatro capas** (CA-5)
  - Objetivo: generar `ping-domain`, `ping-application`, `ping-infrastructure` y `ping-interface` con la skill `crear-modulo`, `pnpm install`, y quitar el código de ejemplo.
  - Archivos: `modules/ping/*/` (project.json, package.json, tsconfig, jest, eslint), `tsconfig.base.json`.
  - Prueba primero: `pnpm nx show project ping-domain` muestra etiquetas `scope:ping` y `type:domain` (igual para las demás capas).
  - Verificación: `pnpm nx run-many -t lint build -p ping-domain ping-application ping-infrastructure ping-interface`
  - Nota: las dependencias `workspace:*` entre capas se declaran en T3–T5, al importar (el lint `@nx/dependency-checks` rechaza dependencias sin uso).
  - Depende de: nada.

- [x] **T2 — Dominio: `Pong` y `EmpresaRequeridaError`** (CA-1, CA-2)
  - Archivos: `modules/ping/domain/src/lib/pong.ts`, `pong.spec.ts`, `src/index.ts`.
  - Prueba primero: `pong.spec.ts` (empresa válida crea `Pong` con `pong`, empresa e instante; `null`, `undefined`, `''` y `'   '` lanzan `EmpresaRequeridaError`; el id se recorta).
  - Verificación: `pnpm nx test ping-domain` · `pnpm nx lint ping-domain`
  - Depende de: T1.

- [x] **T3 — Aplicación: `RelojPort` y `HacerPing`** (CA-1, CA-3, CA-4)
  - Archivos: `modules/ping/application/src/lib/reloj.port.ts`, `hacer-ping.ts`, `hacer-ping.spec.ts`, `src/index.ts`.
  - Prueba primero: `hacer-ping.spec.ts` con reloj simulado fijo (empresa "A" → resultado esperado; "A" y "B" sin mezcla; instante igual al del reloj; empresa ausente propaga `EmpresaRequeridaError`).
  - Verificación: `pnpm nx test ping-application` · `pnpm nx lint ping-application`
  - Depende de: T2.

- [x] **T4 — Infraestructura: `RelojSistema`** (CA-4)
  - Archivos: `modules/ping/infrastructure/src/lib/reloj-sistema.ts`, `reloj-sistema.spec.ts`, `src/index.ts`.
  - Prueba primero: `ahora()` devuelve un `Date` entre dos lecturas de `Date.now()` y cumple el contrato de `RelojPort`.
  - Verificación: `pnpm nx test ping-infrastructure` · `pnpm nx lint ping-infrastructure`
  - Depende de: T3.

- [x] **T5 — Interfaz: `manejarPing` y `PeticionInvalidaError`** (CA-1, CA-2)
  - Archivos: `modules/ping/interface/src/lib/ping.handler.ts`, `ping.handler.spec.ts`, `src/index.ts`.
  - Prueba primero: `ping.handler.spec.ts` (respuesta con `instante` en ISO 8601; empresa vacía → `PeticionInvalidaError` sin detalles internos).
  - Verificación: `pnpm nx test ping-interface` · `pnpm nx lint ping-interface`
  - Depende de: T3. (No depende de infraestructura.)

- [x] **T6 — Verificación de límites y cobertura** (CA-5)
  - Objetivo: comprobar que ninguna capa importa una capa prohibida y que la cobertura de `domain` y `application` es ≥ 80 %.
  - Prueba: importación prohibida temporal (`ping-interface` → `ping-infrastructure`) **hace fallar** el lint; se revierte.
  - Verificación: `pnpm nx run-many -t lint test -p ping-domain ping-application ping-infrastructure ping-interface` · `pnpm nx test ping-domain --coverage` · `pnpm nx test ping-application --coverage`
  - Depende de: T1–T5.

## Cobertura de criterios

| Criterio | Tareas     |
| -------- | ---------- |
| CA-1     | T2, T3, T5 |
| CA-2     | T2, T5     |
| CA-3     | T3         |
| CA-4     | T3, T4     |
| CA-5     | T1, T6     |
