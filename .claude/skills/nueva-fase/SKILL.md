---
description: Prepara el documento de una nueva fase del producto para aprobación.
argument-hint: <número de fase>
disable-model-invocation: true
---
Prepara la Fase $ARGUMENTS.

1. Lee `docs/fases/README.md`, el documento de la fase anterior (sección "Aprendizajes") y `docs/fase0/ruta-crecimiento.md`.
2. Propón en una sola ronda: objetivo, 2 a 4 funcionalidades que entreguen valor de punta a punta, y qué elementos de la ruta de crecimiento se activan.
3. Con las respuestas, crea `docs/fases/fase-$ARGUMENTS.md` con la plantilla `plantilla.md` de esta carpeta (máximo 60 líneas).
4. Agrega la fase al índice y actualiza `docs/estado.md`.

Espera "aprobado". Después, cada funcionalidad empieza con `/spec`.
