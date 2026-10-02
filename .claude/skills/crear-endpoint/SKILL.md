---
name: crear-endpoint
description: Agrega un endpoint REST a apps/api conectado a un caso de uso de un módulo, con contrato OpenAPI, DTO y pruebas (incluido aislamiento por empresa). Úsala cuando haya que exponer un caso de uso por HTTP.
---

# crear-endpoint

Argumentos: módulo, caso de uso y verbo/ruta (ej. `ordenes-servicio crear POST /ordenes-servicio`).

## Pasos

1. Confirma que el caso de uso existe en `modules/<m>/application` y está probado. Si no, créalo primero con `/implement`.
2. Contrato: define el DTO de entrada/salida en `packages/contracts` (fuente de verdad del OpenAPI y de los clientes generados). Los cambios deben ser compatibles hacia atrás.
3. **Escribe primero la prueba**: petición válida, validación de entrada, y aislamiento (una empresa A no accede a datos de B; sin empresa → falla).
4. Controlador en `modules/<m>/interface` (delgado: valida, invoca el caso de uso, mapea a DTO). La empresa se toma del contexto autenticado, nunca del cuerpo ni de parámetros.
5. Registra el controlador en `apps/api` (`app.module.ts`) inyectando los adaptadores de `infrastructure`. Sin lógica de negocio en `apps/api`.
6. Decoradores OpenAPI (`@nestjs/swagger`) con ejemplos; errores sin datos personales ni detalles internos.
7. Verifica: `pnpm nx test api`, `pnpm nx lint api` y los de los proyectos del módulo.

## Criterio de terminado
Endpoint documentado, DTO en `packages/contracts`, pruebas (feliz, validación, aislamiento) y lint en verde, sin importar `infrastructure` desde `interface`.
