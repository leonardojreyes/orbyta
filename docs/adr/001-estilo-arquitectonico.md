# ADR 001: Estilo arquitectónico — monolito modular + hexagonal (DDD)

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta tiene un plazo de un mes y debe soportar múltiples módulos de negocio (proyectos, órdenes de servicio, abonados, personal, contratos, integración ERP) con reglas propias por dominio, multiempresa desde el día uno, e IA y ERP como integraciones que no deben acoplar el dominio. Separar en microservicios desde el inicio añadiría costo operativo (red, despliegue, observabilidad distribuida) incompatible con el plazo y con un equipo pequeño.

## Decisión
Construir un **monolito modular**: un único desplegable (`apps/api` + `apps/worker`) compuesto de módulos de negocio independientes (`modules/<modulo>/`), cada uno organizado en **arquitectura hexagonal** (domain, application, infrastructure, interface). El dominio no conoce frameworks, base de datos, ERP ni IA. Un módulo se separa a servicio independiente solo cuando haya una razón medible (carga, equipo dedicado, ciclo de despliegue distinto).

## Alternativas consideradas
- **Microservicios desde el inicio:** mayor complejidad operativa y de red; incompatible con el plazo de 8 días de Fase 0 y 1 mes de producto.
- **Monolito no modular (big ball of mud):** más rápido al inicio, pero no sostiene el crecimiento a 5+ módulos de negocio ni permite separar módulos después sin reescritura.

## Consecuencias
- Nx aplica reglas de límites entre módulos y capas (paso 0.2), haciendo fallar el build ante una importación prohibida.
- El dominio es testeable sin infraestructura real (bases de datos, colas, HTTP).
- Separar un módulo en el futuro es una extracción, no una reescritura, porque ya está aislado por capas.

## Licencia
No aplica (decisión arquitectónica, sin dependencia de software).
