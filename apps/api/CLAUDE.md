# apps/api

API REST de Orbyta con NestJS (ADR 002). Contrato OpenAPI publicado desde `packages/contracts`.

## Reglas
- Solo **composición**: arma los módulos de `modules/*/interface` e inyecta adaptadores de `infrastructure`. Sin reglas de negocio aquí.
- Controladores delgados: validan entrada, llaman un caso de uso de `application`, mapean la salida a DTO.
- La empresa sale del contexto autenticado, nunca del cuerpo ni de parámetros de la petición.
- Todo endpoint documentado en OpenAPI y con pruebas (incluida una de aislamiento entre empresas si toca datos).
- Cambios de contrato compatibles hacia atrás (el pipeline usa oasdiff, paso 0.4).
- Errores sin datos personales ni detalles internos.

## Comandos
`pnpm nx serve api` · `pnpm nx test api` · `pnpm nx lint api` · `pnpm nx build api`

Skill para nuevos endpoints: `crear-endpoint`.
