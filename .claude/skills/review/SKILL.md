---
description: Revisa la rama actual con los subagentes revisores y consolida los hallazgos.
disable-model-invocation: true
---
Revisa los cambios de la rama actual contra `main`.

1. Obtén el diff (`git diff main...HEAD --stat` y luego el diff de los archivos relevantes).
2. Invoca, uno tras otro: `arquitecto`, `revisor-seguridad` y, si el diff toca `apps/web` o `packages/ui`, `revisor-ui`.
3. Consolida en una sola tabla: gravedad, archivo, hallazgo, corrección. Elimina duplicados.
4. Corrige los hallazgos críticos y altos solo si el usuario lo aprueba.

Terminado cuando: no quedan hallazgos críticos ni altos abiertos.
