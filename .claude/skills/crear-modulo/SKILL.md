---
description: Crea un módulo de negocio nuevo con sus cuatro capas, su CLAUDE.md, la prueba de aislamiento y el registro en la raíz de composición. Úsala siempre que haga falta un módulo nuevo en modules/.
---
Crea el módulo indicado:

1. Copia la estructura de `modules/_ejemplo/` a `modules/<nombre>/` (domain, application, infrastructure, interface).
2. Crea `modules/<nombre>/CLAUDE.md` con la plantilla `plantillas/CLAUDE-modulo.md` (máximo 30 líneas).
3. Crea la migración inicial con `empresa_id` y política RLS, y la prueba de aislamiento entre empresas.
4. Registra el módulo en `apps/api` y sus reglas de límites en dependency-cruiser.
5. Agrega sus términos a `docs/glosario.md`.
6. Ejecuta build y pruebas del módulo.
