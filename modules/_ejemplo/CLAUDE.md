<!-- Presupuesto: máximo 30 líneas. Se carga solo cuando Claude trabaja en este módulo. -->
# Módulo _ejemplo

**Propósito:** módulo de referencia para copiar con `/crear-modulo`; no es del producto.
**Entidades:** `Nota` (id, empresaId inmutable, título).
**Casos de uso:** `CrearNota`, `ListarNotas`.
**Puertos que usa:** `RepositorioNotas` (propio); `EjecutorEmpresa` (`platform/tenancy`).
**Eventos que publica / consume:** ninguno.
**Depende de los módulos:** ninguno (comunicación por eventos o puertos)
**Spec de origen:** ninguna (ejemplo de la Fase 0).

## Reglas propias del módulo
- Tabla `ejemplo_notas` con RLS; migración en `infrastructure/migrations/`.
- La prueba `infrastructure/aislamiento.test.ts` corre contra PostgreSQL real.
