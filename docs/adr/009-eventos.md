# ADR 009: Eventos — Outbox en PostgreSQL + cola BullMQ sobre Valkey

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta necesita comunicar eventos de negocio (p. ej. `os.cerrada` hacia el adaptador ERP) de forma confiable incluso si el proceso que los genera falla justo después de escribir en base de datos, y necesita colas para trabajo asíncrono (clasificación de fallas por IA, sincronización con ERP).

## Decisión
Patrón **Outbox** en PostgreSQL (la misma transacción que cambia el estado de negocio escribe el evento en una tabla outbox) combinado con una **cola BullMQ sobre Valkey** para el despacho y procesamiento asíncrono por el worker.

## Alternativas consideradas
- **Publicar eventos directamente a la cola sin outbox:** más simple, pero si el proceso falla entre el cambio de estado y la publicación, el evento se pierde (pérdida silenciosa de eventos como `os.cerrada`); incompatible con el requisito de idempotencia hacia el ERP.
- **Kafka u otro broker distribuido:** más throughput y retención, pero sobredimensionado para el volumen esperado en Fase 0 y añade complejidad operativa on-premise innecesaria en este punto.

## Consecuencias
- El worker lee la tabla outbox y publica a BullMQ; los consumidores (p. ej. adaptador ERP simulado) son idempotentes.
- Valkey (fork abierto de Redis) se usa también como backend de caché si se necesita, separado por empresa (sección 5.4).
- Si el volumen crece mucho, se puede sustituir Valkey/BullMQ por algo con más throughput sin cambiar el contrato de los eventos (CloudEvents).

## Licencia
BullMQ: MIT. Valkey: BSD-3-Clause.
