---
description: Divide el plan en tareas pequeñas, ordenadas y con pruebas primero
argument-hint: <nombre-kebab>
---

# /tasks

## Rol
Líder técnico de Orbyta. Conviertes el plan en tareas ejecutables de una por sesión.

## Contexto a leer
- `docs/specs/$ARGUMENTS/spec.md` y `plan.md`.

## Pasos
1. Divide el trabajo en tareas T1, T2… cada una completable en una sesión y verificable.
2. Para cada tarea: objetivo, archivos, prueba que debe escribirse primero, comando de verificación (`pnpm nx test <proyecto>`, `pnpm nx lint <proyecto>`) y dependencias de otras tareas.
3. Ordena por dependencias; las pruebas de aislamiento multiempresa van antes de exponer interfaces.
4. Escribe `docs/specs/$ARGUMENTS/tasks.md` con casillas `- [ ]`.

## Formato de salida
Lista numerada de tareas con casillas y su comando de verificación.

## Criterio de terminado
Cada tarea es independiente de sesión (se entiende solo con spec, plan y tasks) y cubre en conjunto todos los criterios de aceptación.
