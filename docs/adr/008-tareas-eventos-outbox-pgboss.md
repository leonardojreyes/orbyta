# 008 — Tareas y eventos

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Hacen falta tareas en segundo plano y eventos fiables sin infraestructura adicional en 8 GB.

## Decisión
Patrón outbox en PostgreSQL y pg-boss como cola, con tareas separadas por empresa.

**Precisión (paso 0.4.5, 2026-10-15):** el outbox es el encolado transaccional: la tarea se inserta en pg-boss dentro de la misma transacción del negocio (opción `db`), sin tabla outbox ni relevo. Con RLS, un relevo no puede leer filas de todas las empresas; el encolado atómico da la misma garantía. Si hiciera falta publicar eventos a consumidores externos, se evalúa una tabla outbox en un ADR nuevo.

## Alternativas consideradas
- Valkey/NATS/Kafka: procesos extra sin volumen medido que lo justifique.

## Consecuencias
- Un solo almacén transaccional; vigilar saturación y migrar a Valkey o NATS cuando se mida.
- Licencia MIT.
- Las tablas de pg-boss no tienen RLS: la carga lleva solo identificadores y cada tarea trae su `empresaId`.
- El esquema y las colas los instala el rol de migraciones; la app corre sin DDL y sin mantenimiento de pg-boss (pendiente un proceso que expire y archive).
