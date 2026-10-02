# ADR 017: Archivos — almacenamiento compatible S3 (SeaweedFS), diferido

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). Implementación diferida.

## Contexto
Las órdenes de servicio probablemente necesitarán fotos y adjuntos (evidencia de campo), pero el esqueleto caminante de la Fase 0 (sección 7) no requiere adjuntos para su criterio de salida.

## Decisión
Se elige **SeaweedFS** (almacenamiento compatible S3, abierto) como solución objetivo para archivos, pero **se difiere su instalación e integración** a una fase posterior. No se construye ningún adaptador de almacenamiento de archivos en Fase 0.

## Alternativas consideradas
- **MinIO:** también compatible S3 y abierto, pero su licencia cambió a AGPL-3.0 para versiones recientes del servidor en modo distribuido; se prefiere revisar la licencia vigente al momento de implementar antes de descartar SeaweedFS.
- **Implementarlo ya en Fase 0:** adelantaría una necesidad real (fotos de campo), pero no es parte del esqueleto caminante y ampliaría el alcance sin aprobación (regla 3.1).

## Consecuencias
- Registrado en `docs/fase0/deuda-planificada.md` con disparador: "cuando una historia de usuario requiera adjuntar fotos/archivos a una orden de servicio".
- El puerto de almacenamiento de archivos (si se define) debe seguir el mismo patrón de puerto+adaptador que ERP e IA (principio 5.2.8 extendido por analogía).

## Licencia
SeaweedFS: Apache 2.0.
