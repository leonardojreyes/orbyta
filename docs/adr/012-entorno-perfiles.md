# 012 — Entorno y perfiles

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Desarrollo en Windows y macOS con 8 GB de RAM: sin contenedores locales.

## Decisión
Versiones fijadas con mise.toml, PostgreSQL nativo, perfil elegido con PERFIL (local o servidor), scripts en Node y pnpm recursos para medir el presupuesto.

## Alternativas consideradas
- Docker local: consume RAM y disco que no hay.

## Consecuencias
- El dominio no sabe en qué perfil corre.
- mise y PostgreSQL aún no están instalados; se instalan en el paso 0.2 con aprobación.
- Licencia MIT.
