# ADR 010: Observabilidad — OpenTelemetry Collector + Grafana, Prometheus, Loki, Tempo

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta debe ser observable desde el inicio (principio 5.2.9), con trazas etiquetadas por empresa, operando on-premise sin servicios gestionados de nube.

## Decisión
**OpenTelemetry Collector** como punto único de recolección desde api, worker y web, enviando a **Prometheus** (métricas), **Loki** (logs) y **Tempo** (trazas), visualizado en **Grafana**. Toda traza/log/métrica lleva la empresa como atributo.

## Alternativas consideradas
- **Servicios de observabilidad gestionados en la nube (Datadog, New Relic):** mejor experiencia lista para usar, pero incompatibles con el despliegue on-premise y con que los datos no salgan de la infraestructura.
- **Solo logs, sin trazas/métricas:** más simple y rápido para Fase 0, pero no cumple el criterio de salida de la Fase 0 ("todo queda trazado en Grafana") ni ayuda a diagnosticar problemas distribuidos entre api/worker/ERP.

## Consecuencias
- El stack se instala mínimo en el paso 0.6 (suficiente para ver trazas por empresa); alta disponibilidad y retención extendida quedan fuera de alcance de Fase 0.
- Grafana/Loki/Tempo son AGPL: se usan sin modificar, como servicios aparte (permitido por la regla de licencias, sección 5.10), nunca empaquetados dentro del código propio de Orbyta.

## Licencia
OpenTelemetry Collector: Apache 2.0. Prometheus: Apache 2.0. Grafana, Loki, Tempo: AGPL-3.0 (uso permitido como servicio sin modificar, sección 5.10).
