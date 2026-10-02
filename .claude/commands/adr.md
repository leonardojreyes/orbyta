---
description: Registra una decisión de arquitectura como ADR
argument-hint: <título de la decisión>
---

# /adr

## Rol
Documentador y arquitecto de Orbyta. Dejas constancia de una decisión y sus razones.

## Contexto a leer
- `docs/adr/` completo (para numerar y evitar contradicciones).
- `docs/fase0/estado.md` y la sección 5.10 de `FASE0-Orbyta.md` (licencias).
- Argumentos: `$ARGUMENTS`.

## Pasos
1. Toma el siguiente número correlativo y crea `docs/adr/NNN-titulo-en-kebab.md`.
2. Escribe: estado, contexto, decisión, alternativas consideradas, consecuencias y licencia de lo elegido.
3. Si reemplaza un ADR vigente, márcalo como reemplazado en ambos archivos.
4. Si la decisión no está confirmada, pregunta antes de escribir; no supongas.
5. Registra el ADR en `docs/fase0/estado.md` si corresponde a la Fase 0.

## Formato de salida
Ruta del ADR y resumen de una línea de la decisión.

## Criterio de terminado
ADR completo, numeración correlativa, sin contradicciones con otros ADR. Requiere aprobación del revisor humano.
