---
description: Implementa una sola tarea de una funcionalidad con pruebas primero.
argument-hint: <nombre-funcionalidad> <número-de-tarea>
disable-model-invocation: true
---
Implementa la tarea indicada en: $ARGUMENTS

1. Lee solo la tarea en `docs/specs/<funcionalidad>/tareas.md` y las secciones de `diseno.md` que la afectan.
2. Crea una rama `feat/<funcionalidad>-<tarea>` si no existe.
3. Pide al subagente `ingeniero-pruebas` las pruebas de la tarea y confirma que fallan.
4. Implementa lo mínimo para que pasen. Respeta las reglas que se cargan al abrir cada archivo.
5. Ejecuta tipos, lint y pruebas solo del paquete afectado.
6. Marca la tarea como hecha en `tareas.md`.

Terminado cuando: pruebas en verde, sin errores de tipos ni lint. Reporta y espera "aprobado". No empieces otra tarea en esta sesión.
