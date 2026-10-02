# ADR 011: Ejecución — Kubernetes (k3s) + Helm; Docker Compose en desarrollo

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
El despliegue es on-premise. En la ronda de preguntas de arranque se confirmó que **no existe un clúster Kubernetes todavía** y que, por ahora, el único cómputo disponible es la computadora de desarrollo (sin servidores on-premise asignados aún — ver riesgo en `docs/fase0/estado.md`).

## Decisión
**k3s** como distribución de Kubernetes (ligera, apta para on-premise e incluso para un solo nodo mientras no haya servidores dedicados), con **Helm** para empaquetar y desplegar api, worker y web. En el entorno de desarrollo de cada programador se usa **Docker Compose** (sobre Rancher Desktop o Podman Desktop, ADR 018) en lugar de Kubernetes, para no exigir un clúster local a cada máquina.

## Alternativas consideradas
- **RKE2 u OpenShift:** más robustos para producción a gran escala, pero más pesados de instalar y operar que k3s para un primer clúster de una sola organización; se reconsiderará si la carga o los requisitos de alta disponibilidad lo exigen (paso 0.8, diferido).
- **Sin Kubernetes (solo Docker Compose también en "producción"):** más simple de operar al inicio, pero no escala a múltiples réplicas ni separa pruebas/producción de forma estándar, e incumple el principio "todo como código" con un operador real (CloudNativePG, Keycloak Operator, etc.).

## Consecuencias
- Mientras no haya servidores on-premem asignados, k3s puede correr en un solo nodo (la misma máquina de desarrollo), documentado como riesgo temporal.
- Los charts Helm propios se construyen en el paso 0.8; las dependencias (CloudNativePG, Keycloak, Valkey, Ollama, LiteLLM, Grafana) se instalan por sus charts oficiales.
- No hay separación real de ambientes de pruebas/producción todavía (confirmado en la ronda de preguntas): se registra como riesgo y se exige resolverlo antes de dar por cerrado el paso 0.8.

## Licencia
Kubernetes y k3s: Apache 2.0. Helm: Apache 2.0.
