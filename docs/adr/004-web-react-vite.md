# 004 — Web

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Producto web para corporaciones; la app móvil llegará con la primera funcionalidad móvil.

## Decisión
SPA con React, Vite y TanStack Router. Móvil con React Native + Expo cuando llegue ese disparador (ver ruta de crecimiento).

## Alternativas consideradas
- Next.js (SSR): innecesario para una aplicación interna autenticada y más pesado.
- Angular/Vue: menor reutilización con el móvil futuro.

## Consecuencias
- Un solo ecosistema de componentes entre web y móvil.
- Licencia MIT; ecosistema mayoritario.
