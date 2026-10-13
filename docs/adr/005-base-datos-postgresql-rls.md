# 005 — Base de datos

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
El aislamiento entre empresas debe garantizarlo la base de datos, no solo la aplicación.

## Decisión
PostgreSQL con Row Level Security; cada transacción fija la empresa con SET LOCAL app.empresa_id; la app usa un rol sin BYPASSRLS. Migraciones versionadas. Base compartida por defecto, dedicada por configuración.

## Alternativas consideradas
- Una base por empresa desde el inicio: costo de RAM y operación.
- Filtro solo en aplicación: un error expone datos de otra empresa.

## Consecuencias
- Aislamiento verificable con una prueba contra PostgreSQL real por módulo.
- Exige disciplina en cada consulta; sin empresa, la consulta falla.
- Licencia PostgreSQL.
