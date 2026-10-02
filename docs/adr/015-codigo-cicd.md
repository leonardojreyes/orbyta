# ADR 015: Código y CI/CD — GitHub + GitHub Actions + runner autohospedado

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). La URL del repositorio concreto queda pendiente (ver `docs/fase0/estado.md`); esta decisión fija la herramienta, no el repositorio.

## Contexto
El código debe vivir en un sistema que soporte pull requests, revisión obligatoria y pipelines automatizados, con despliegue a infraestructura on-premem sin exponerla directamente a internet.

## Decisión
**GitHub** (organización de SynapTech) para el código y **GitHub Actions** para CI, con un **runner autohospedado on-premem** dedicado a este repositorio privado, en un host aislado, para los pasos que necesitan desplegar a la infraestructura interna (Helm, OpenTofu).

## Alternativas consideradas
- **GitLab autogestionado:** también viable y abierto, pero el equipo y la organización de SynapTech ya operan sobre GitHub, y cambiar de plataforma no aporta valor a la Fase 0.
- **Runners alojados por GitHub (sin autohospedado):** más simple de configurar, pero no pueden alcanzar la red interna on-premise para desplegar sin exponer la infraestructura a internet.

## Consecuencias
- Pendiente: URL del repositorio vacío en GitHub y confirmación de `gh` autenticado (bloqueante para el paso 0.2, no para el 0.1).
- El runner autohospedado se configura en el paso 0.8, en un host aislado, solo para este repositorio.
- La protección de `main` (PR obligatorio, controles en verde, una aprobación) se configura en el paso 0.4.

## Licencia
GitHub Actions: servicio (no aplica licencia de software propio en este ADR).
