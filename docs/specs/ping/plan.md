# Plan: ping

Spec: [`spec.md`](./spec.md). Módulo temporal; se elimina al cerrar la prueba del paso 0.3.

## Resumen

Módulo `ping` con las cuatro capas. El dominio valida la empresa y construye el `Pong`; la aplicación expone el caso de uso `HacerPing` y el puerto `RelojPort`; la infraestructura aporta el reloj del sistema; la interfaz adapta una petición a una respuesta. Sin `apps/api`, sin contratos compartidos, sin eventos, sin base de datos.

## Capas, proyectos y archivos

Proyectos Nx con nombre único `ping-<capa>` y etiquetas `scope:ping` + `type:<capa>` (generados con la skill `crear-modulo`).

| Capa           | Proyecto / paquete                                    | Archivos                                                                                | Depende de          |
| -------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| domain         | `ping-domain` / `@orbyta/ping-domain`                 | `modules/ping/domain/src/lib/pong.ts`, `pong.spec.ts`                                   | nada                |
| application    | `ping-application` / `@orbyta/ping-application`       | `modules/ping/application/src/lib/reloj.port.ts`, `hacer-ping.ts`, `hacer-ping.spec.ts` | domain              |
| infrastructure | `ping-infrastructure` / `@orbyta/ping-infrastructure` | `modules/ping/infrastructure/src/lib/reloj-sistema.ts`, `reloj-sistema.spec.ts`         | domain, application |
| interface      | `ping-interface` / `@orbyta/ping-interface`           | `modules/ping/interface/src/lib/ping.handler.ts`, `ping.handler.spec.ts`                | domain, application |

Se elimina el código de ejemplo generado por Nx (`ping-<capa>.ts` y su spec) y cada `index.ts` exporta solo la API pública.

## Modelo

- **domain** `Pong` (valor inmutable): `{ mensaje: 'pong', empresaId: string, instante: Date }`.
  `crearPong(empresaId: string | null | undefined, instante: Date): Pong` lanza `EmpresaRequeridaError` si `empresaId` es nulo, vacío o solo espacios (el id se recorta con `trim`).
- **application**
  - Puerto `RelojPort { ahora(): Date }` (el dominio no lee el reloj; CA-4).
  - Caso de uso `HacerPing(reloj: RelojPort)` con `ejecutar({ empresaId }): Pong`, que llama a `crearPong(empresaId, reloj.ahora())`.
- **infrastructure** `RelojSistema implements RelojPort` → `new Date()`.
- **interface** `manejarPing(casoDeUso, { empresaId }): { mensaje: string; empresaId: string; instante: string }` (fecha en ISO 8601). Traduce `EmpresaRequeridaError` a un error de validación de la capa (`PeticionInvalidaError`) sin detalles internos. Sin NestJS: no hay endpoint en esta prueba.

## Contratos y eventos

Ninguno (no se toca `packages/contracts` ni el outbox).

## Estrategia de pruebas (pruebas primero)

| Criterio | Prueba                                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-1     | `hacer-ping.spec.ts`: empresa "A" → `pong`, empresa "A", instante del reloj simulado. `ping.handler.spec.ts`: salida con `instante` en ISO.                      |
| CA-2     | `pong.spec.ts`: `null`, `undefined`, `''`, `'   '` lanzan `EmpresaRequeridaError`. `ping.handler.spec.ts`: se traduce a `PeticionInvalidaError`.                 |
| CA-3     | `hacer-ping.spec.ts`: dos ejecuciones con "A" y "B" devuelven cada una su empresa.                                                                               |
| CA-4     | `hacer-ping.spec.ts` con reloj simulado fijo (resultado determinista); `reloj-sistema.spec.ts` comprueba que `ahora()` queda entre dos lecturas de `Date.now()`. |
| CA-5     | `pnpm nx run-many -t lint -p ping-domain ping-application ping-infrastructure ping-interface` y `pnpm nx graph`/`nx show project` sin dependencias prohibidas.   |

Cobertura esperada ≥ 80 % en `domain` y `application`. No aplican pruebas de integración ni de aislamiento contra base de datos (no hay datos compartidos); el aislamiento por empresa se cubre con CA-3.

## Riesgos

- Los proyectos existentes de `ordenes-servicio` se llaman `domain`, `application`…; `ping-*` usa nombres únicos para no chocar.
- Faltan dependencias `workspace:*` entre capas si no se declaran en `package.json`; se declara y se ejecuta `pnpm install`.

## ADRs necesarios

Ninguno: aplica sin cambios lo decidido en ADR 001 (hexagonal) y ADR 003 (monorepo).

## Revisión

Revisión del subagente `arquitecto` pendiente. Espera aprobación humana antes de `/tasks`.
