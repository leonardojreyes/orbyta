# ADR 008: Autorización — RBAC detrás de un puerto; OpenFGA diferido

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta necesita roles iniciales (administrador de empresa, supervisor, técnico, consulta) desde el paso 0.6, pero permisos finos por recurso (p. ej. un supervisor viendo solo las OS de su cuadrilla) no son necesarios todavía y añadirían complejidad al plazo de Fase 0.

## Decisión
**RBAC** (basado en roles) implementado detrás de un **puerto de autorización** del dominio, de forma que el mecanismo concreto (RBAC hoy, ReBAC después) no se fugue a los módulos de negocio. **OpenFGA** se evalúa cuando aparezcan permisos finos reales.

## Alternativas consideradas
- **OpenFGA desde el inicio:** más potente para permisos finos, pero añade un componente más a operar y aprender sin un requisito concreto que lo justifique en Fase 0 (regla "no amplíes el alcance sin aprobación").
- **Autorización embebida en cada módulo sin puerto:** más rápido al inicio, pero acopla el dominio al mecanismo de autorización, dificultando el cambio a ReBAC después.

## Consecuencias
- Los roles se verifican a través del puerto, nunca consultando Keycloak directamente desde el dominio.
- Migrar a OpenFGA en el futuro es cambiar el adaptador detrás del puerto, no reescribir los módulos de negocio.
- Se registra en `docs/fase0/deuda-planificada.md` con el disparador: "cuando exista un requisito real de permisos por recurso/jerarquía".

## Licencia
OpenFGA (si se adopta después): Apache 2.0.
