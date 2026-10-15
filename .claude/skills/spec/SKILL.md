---
description: Crea la especificación de una funcionalidad a partir de una descripción en lenguaje natural.
argument-hint: <nombre-funcionalidad> <descripción>
disable-model-invocation: true
---
Especifica la funcionalidad: $ARGUMENTS

1. Lee `docs/producto.md`, `docs/glosario.md` y el documento de la fase actual (`docs/fases/`).
2. Haz las preguntas necesarias para eliminar ambigüedades (máximo 5, en una sola ronda).
3. Crea `docs/specs/<nombre>/requisitos.md` (máximo 80 líneas) con: objetivo, usuarios, historias, criterios de aceptación verificables (Dado/Cuando/Entonces), datos personales involucrados, fuera de alcance.
4. Agrega una fila en `docs/specs/README.md` con estado "Especificada".
5. Agrega al glosario los términos nuevos.

Terminado cuando: cada criterio de aceptación se puede convertir en una prueba. Espera "aprobado".
