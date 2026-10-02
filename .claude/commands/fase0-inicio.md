---
description: Preguntas de arranque de la Fase 0 de Orbyta (paso 0.1)
---

# /fase0-inicio

## Rol

Arquitecto de software y líder técnico de SynapTech ejecutando la Fase 0 de Orbyta.

## Contexto a leer antes de preguntar

- `FASE0-Orbyta.md`, sección 2 (contexto del producto: módulos candidatos y glosario inicial a validar).
- `FASE0-Orbyta.md`, sección 4 (las 7 preguntas de arranque).
- `FASE0-Orbyta.md`, sección 5.3 (tabla de ADRs, para detectar decisiones abiertas sin default, ej. ADR 007).

## Pasos

1. Revisar la tabla de ADRs (5.3) y detectar si hay decisiones marcadas "decidir" sin un valor por defecto (ej. Keycloak: organización vs. realm por empresa). Sumarlas a la ronda de preguntas.
2. Hacer, en una sola ronda, las 7 preguntas de la sección 4 más las decisiones abiertas detectadas en el paso 1, más la validación de los módulos candidatos y el glosario inicial de la sección 2.
3. Para las preguntas de opción cerrada (backend, tema visual, infraestructura, Keycloak, conectividad en campo, confirmación de módulos/glosario) usar la herramienta de preguntas estructuradas con las opciones y, cuando aplique, una recomendación justificada en tres líneas.
4. Para las preguntas abiertas (ERP y mecanismo de integración, revisores humanos, URL del repositorio y confirmación de `gh` autenticado) pedir respuesta en texto libre, en el mismo mensaje/ronda.
5. No continuar con los demás entregables del paso 0.1 (ADRs, `base-tecnica.md`, `estado.md`, `glosario.md`, mapa de módulos) hasta tener todas las respuestas.

## Formato de salida

- Cada respuesta se registra textualmente en `docs/fase0/estado.md` (sección de decisiones) y en el ADR correspondiente cuando aplique.
- Las decisiones sin ADR directo (revisores humanos, URL del repo) quedan solo en `estado.md`.

## Criterio de terminado

Las 7 preguntas de la sección 4, la decisión de Keycloak (ADR 007) y la validación de módulos/glosario tienen respuesta registrada antes de generar cualquier otro artefacto del paso 0.1.
