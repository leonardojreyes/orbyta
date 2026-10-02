# ADR 020: Integración ERP — puerto + adaptador; Palmera por tablas/vistas de base de datos

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). ERP y mecanismo confirmados en la ronda de preguntas de `/fase0-inicio`.

## Contexto
La integración con el ERP es obligatoria (sección 2). Se confirmó que el ERP es **Palmera**, un desarrollo interno de la empresa (no un producto de mercado), y que se integra **por tablas/vistas de base de datos**, no por API REST/SOAP ni archivos ni cola de mensajes.

## Decisión
Puerto `ErpPort` en `modules/integracion-erp/application`, con un adaptador por ERP en `infrastructure`. En Fase 0 **solo existe un adaptador simulado** (no se conecta a Palmera todavía); el adaptador real para Palmera se construye en Fase 1 y leerá/escribirá mediante **vistas de base de datos** (preferible a tablas base, para no acoplarse al esquema interno de Palmera y poder evolucionar ambos lados de forma independiente). La comunicación de eventos de negocio (p. ej. `os.cerrada`) sigue siendo asíncrona por outbox con CloudEvents, idempotencia y reintentos (ADR 009), independientemente del mecanismo de lectura/escritura hacia Palmera.

## Alternativas consideradas
- **Conectar directamente a las tablas base de Palmera sin vistas intermedias:** más rápido de implementar, pero acopla Orbyta al esquema interno de Palmera; cualquier cambio de esquema en Palmera rompería la integración sin aviso. Se prefiere pedir vistas dedicadas al equipo de Palmera como contrato de integración.
- **Pedir a Palmera que exponga una API:** más alineado con el principio "contrato primero" (sección 5.2.4), pero no es viable ahora porque Palmera es un desarrollo interno sin API expuesta; se registra como mejora deseable a futuro.

## Consecuencias
- El adaptador simulado del paso 0.6 consume el evento `os.cerrada` del outbox de forma idempotente y registra la recepción, sin tocar Palmera todavía.
- Antes de construir el adaptador real en Fase 1, se debe definir con el equipo de Palmera: qué vistas existen o se crearán, su periodicidad de actualización, y si la escritura hacia Palmera (cierre de OS con materiales/horas/costos) también será por vista o requiere otro mecanismo (p. ej. tabla de staging).
- Registrado en `docs/fase0/deuda-planificada.md`: definir el contrato exacto de vistas con el equipo de Palmera antes de Fase 1.

## Licencia
No aplica (integración a medida, sin dependencia de terceros con licencia propia).
