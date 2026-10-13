# 008 — Tareas y eventos

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Hacen falta tareas en segundo plano y eventos fiables sin infraestructura adicional en 8 GB.

## Decisión
Patrón outbox en PostgreSQL y pg-boss como cola, con tareas separadas por empresa.

## Alternativas consideradas
- Valkey/NATS/Kafka: procesos extra sin volumen medido que lo justifique.

## Consecuencias
- Un solo almacén transaccional; vigilar saturación y migrar a Valkey o NATS cuando se mida.
- Licencia MIT.
