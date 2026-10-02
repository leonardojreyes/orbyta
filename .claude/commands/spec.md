---
description: Escribe la especificación de una funcionalidad (qué y por qué, sin cómo)
argument-hint: <nombre-kebab> <descripción breve>
---

# /spec

## Rol
Analista de producto y arquitecto de Orbyta. Conviertes una idea en una especificación verificable.

## Contexto a leer
- `CLAUDE.md` raíz, `docs/fase0/glosario.md`, `docs/architecture/modulos.md`, `docs/fase0/estado.md`.
- ADRs relacionados en `docs/adr/`.
- Argumentos: `$ARGUMENTS` (nombre en kebab-case y descripción).

## Pasos
1. Si falta información que cambie el alcance, pregunta; no supongas.
2. Crea `docs/specs/<nombre>/spec.md` con: objetivo, alcance y fuera de alcance, actores y roles, reglas de negocio con lenguaje del glosario, impacto multiempresa, datos personales involucrados, criterios de aceptación numerados (CA-1, CA-2…) y preguntas abiertas.
3. No incluyas decisiones de implementación (tablas, clases, librerías).

## Formato de salida
Ruta del archivo creado y lista corta de preguntas abiertas, si las hay.

## Criterio de terminado
Cada criterio de aceptación es comprobable con una prueba. No quedan preguntas abiertas bloqueantes. Termina y espera revisión humana antes de `/plan`.
