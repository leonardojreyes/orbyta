---
description: Registra una decisión de arquitectura como ADR y actualiza el índice.
argument-hint: <título de la decisión>
disable-model-invocation: true
---
Registra el ADR: $ARGUMENTS

1. Toma el siguiente número libre de `docs/adr/README.md`.
2. Crea `docs/adr/NNN-titulo-en-kebab.md` con la plantilla `plantilla.md` de esta carpeta (máximo 40 líneas).
3. Agrega una fila al índice con una frase de la decisión y el estado "Propuesto".
4. Si reemplaza un ADR anterior, marca el anterior como "Reemplazado por NNN".

Espera "aprobado" para cambiar el estado a "Aceptado".
