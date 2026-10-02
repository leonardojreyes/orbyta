# ADR 002: Lenguaje y framework de backend — TypeScript + NestJS

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). Decidido en la ronda de preguntas de `/fase0-inicio`.

## Contexto
El backend debe sostener API, worker y lógica de dominio multiempresa en un plazo de 8 días para la Fase 0 y 1 mes para el producto completo, con web en React/Next.js y móvil en React Native/Expo (ADRs 004 y 005). El equipo trabaja en Windows y macOS.

## Decisión
Backend en **TypeScript + NestJS**, ejecutado en Node.js LTS. Comparte tipos y contratos (OpenAPI generado/consumido) con web y móvil, lo que reduce duplicación y acelera el plazo. NestJS aporta estructura modular (módulos, providers, guards) que encaja con el estilo hexagonal del ADR 001.

## Alternativas consideradas
- **Java + Spring Boot:** muy maduro y con fuerte soporte empresarial, pero no comparte tipos con web/móvil (contratos deben mantenerse aparte) y su boilerplate alarga el plazo de Fase 0.
- **.NET:** tipado fuerte y buen rendimiento, pero menor disponibilidad de talento en el mercado local que TypeScript, y tampoco comparte tipos con el resto del stack.

## Consecuencias
- `apps/api` y `apps/worker` se construyen en Nx con TypeScript; los módulos de negocio (`modules/<modulo>/`) también.
- Los contratos OpenAPI (ADR de contrato-primero, sección 5.2.4) generan clientes TypeScript reutilizables en web y móvil sin reescritura manual.
- Si en el futuro un módulo requiere otro runtime por carga o especialización, se extrae como servicio aparte (ADR 001) sin forzar un cambio de lenguaje global.

## Licencia
Node.js, TypeScript y NestJS son MIT. Sin excepciones de licencia requeridas.
