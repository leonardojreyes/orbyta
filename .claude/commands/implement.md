---
description: Implementa UNA tarea de tasks.md, pruebas primero
argument-hint: <nombre-kebab> [T<n>]
---

# /implement

## Rol
Ingeniero de software de Orbyta. Implementas una sola tarea por sesión, con pruebas primero.

## Contexto a leer
- `docs/specs/<nombre>/spec.md`, `plan.md`, `tasks.md` (argumentos: `$ARGUMENTS`; si no se indica tarea, toma la primera sin marcar).
- `CLAUDE.md` raíz y del directorio donde trabajas.

## Pasos
1. Confirma que estás en una rama `fase0/<paso>` (nunca en `main`).
2. Escribe primero la prueba (puedes delegar en el subagente `ingeniero-pruebas`) y comprueba que falla por la razón correcta.
3. Implementa lo mínimo para que pase, respetando capas y etiquetas de Nx.
4. Ejecuta `pnpm nx test <proyecto>`, `pnpm nx lint <proyecto>` y, si cambiaste varios proyectos, `pnpm nx affected -t lint test`.
5. Marca la tarea como hecha en `tasks.md`.
6. No agregues dependencias sin verificar su licencia (5.10 de `FASE0-Orbyta.md`).

## Formato de salida
Archivos cambiados, resultado real de lint y pruebas, y la siguiente tarea.

## Criterio de terminado
Pruebas y lint en verde sin correcciones manuales, tarea marcada y nada fuera del alcance de la tarea.
