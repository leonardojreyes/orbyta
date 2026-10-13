---
description: Diseña la solución técnica de una funcionalidad ya especificada y la divide en tareas.
argument-hint: <nombre-funcionalidad>
disable-model-invocation: true
---
Diseña la funcionalidad `$ARGUMENTS` en modo plan, sin editar código.

1. Lee `docs/specs/$ARGUMENTS/requisitos.md`, el índice `docs/adr/README.md` y solo los ADR pertinentes.
2. Escribe `docs/specs/$ARGUMENTS/diseno.md` (máximo 100 líneas): módulo afectado o nuevo, entidades, casos de uso, puertos, cambios al contrato OpenAPI, migraciones, impacto multiempresa, datos personales, riesgos.
3. Pide al subagente `arquitecto` que revise el diseño; incorpora sus hallazgos.
4. Escribe `docs/specs/$ARGUMENTS/tareas.md`: tareas numeradas, cada una completable en una sesión, con su prueba de aceptación.
5. Si el diseño cambia una decisión de arquitectura, propón el ADR con `/adr`.

Terminado cuando: cada tarea es verificable y ninguna toca más de un módulo. Espera "aprobado".
