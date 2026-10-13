# 007 — Autorización

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Se necesita control de acceso simple desde el inicio, con salida a modelos más ricos.

## Decisión
Roles y permisos por empresa en PostgreSQL, accedidos solo mediante un puerto de autorización.

## Alternativas consideradas
- OpenFGA desde el inicio: complejidad prematura; queda en la ruta de crecimiento.

## Consecuencias
- Cambiar a OpenFGA después es agregar un adaptador.
- Sin licencia propia.
