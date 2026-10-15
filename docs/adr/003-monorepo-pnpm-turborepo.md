# 003 — Monorepo

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Varias apps y paquetes comparten contratos y tokens; se necesita caché de tareas y ejecución por paquete afectado.

## Decisión
Monorepo con pnpm workspaces y Turborepo; límites entre módulos con dependency-cruiser.

## Alternativas consideradas
- Nx: más pesado para el equipo y la RAM disponibles.
- Repos separados: duplica contratos y complica los cambios atómicos.

## Consecuencias
- Pruebas, lint y tipos solo del paquete afectado, acorde al presupuesto de recursos.
- Licencia MIT.
