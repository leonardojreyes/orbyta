# 002 — Backend: TypeScript + NestJS

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Se necesita un backend liviano para 8 GB de RAM y un solo lenguaje entre backend y web. Decidido por el CTO en el paso 0.1.

## Decisión
Usar TypeScript con NestJS sobre Node.js 22 LTS y SWC. Las capas de dominio no importan NestJS; solo infrastructure e interface lo usan.

## Alternativas consideradas
- Java/Spring Boot: JVM de 500 MB+ por proceso y arranque lento en la MacBook.
- .NET: buen rendimiento, pero un segundo ecosistema distinto al de la web.

## Consecuencias
- Un lenguaje y un conjunto de herramientas para API y web; menor consumo de RAM.
- Tipado débil en tiempo de ejecución: validar en los bordes con el contrato OpenAPI.
- Licencia MIT; Node.js LTS con soporte largo.
