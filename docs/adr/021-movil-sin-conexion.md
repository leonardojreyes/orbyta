# ADR 021: Móvil sin conexión — SQLite local + cola de sincronización

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). Decisión confirmada en la ronda de preguntas: los técnicos de campo trabajan sin señal y la app móvil debe operar sin conexión. Implementación completa en Fase 1.

## Contexto
Los técnicos de campo no siempre tienen señal, pero deben poder seguir viendo y actualizando sus órdenes de servicio asignadas. La app móvil es React Native + Expo (ADR 005).

## Decisión
**SQLite local** en el dispositivo como fuente de datos primaria para las pantallas que el técnico usa en campo (listado y detalle de OS asignadas), con una **cola de sincronización** que acumula cambios hechos sin conexión (cambios de estado, notas) y los envía al backend cuando vuelve la señal, con resolución de conflictos por definir en Fase 1. El **diseño** de este mecanismo se deja listo en Fase 0; la implementación completa es trabajo de Fase 1.

## Alternativas consideradas
- **Sin soporte offline (asumir siempre señal):** más simple, pero contradice directamente la respuesta confirmada en la ronda de preguntas de arranque; dejaría a los técnicos sin poder trabajar en zonas sin cobertura.
- **Offline-first completo ya en Fase 0 (sincronización bidireccional con resolución de conflictos):** es el objetivo final, pero implementarlo completo en 8 días de Fase 0 compite directamente con el resto de entregables del esqueleto caminante; se prioriza el diseño del esquema y se difiere la implementación.

## Consecuencias
- El esquema de datos de `ordenes-servicio` (paso 0.6) se diseña pensando en qué campos necesita el técnico sin conexión, para no rehacerlo en Fase 1.
- Registrado en `docs/fase0/deuda-planificada.md`: implementar la cola de sincronización y la resolución de conflictos en Fase 1, antes de que los técnicos usen la app en campo real.

## Licencia
SQLite: dominio público / licencia equivalente a BSD. Sin restricciones.
