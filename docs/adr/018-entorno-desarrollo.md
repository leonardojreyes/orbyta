# ADR 018: Entorno de desarrollo — Dev Containers

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
El equipo trabaja en Windows y macOS y necesita un entorno de desarrollo reproducible (Node LTS, pnpm, acceso a motor de contenedores) sin depender de herramientas de pago en empresas grandes.

## Decisión
**Dev Containers** (`.devcontainer/`) con Node LTS y pnpm preinstalados, probados sobre **Rancher Desktop** o **Podman Desktop** (ambos abiertos) en Windows con WSL2 y en macOS. Docker Desktop no se usa porque requiere licencia de pago en empresas grandes.

## Alternativas consideradas
- **Docker Desktop:** experiencia muy pulida, pero requiere licencia de pago para empresas grandes (no cumple la regla de licencias/costos de la sección 5.10 por defecto).
- **Sin Dev Containers (instalación manual por desarrollador):** más rápido al inicio, pero genera diferencias de entorno entre Windows y macOS que violan la regla 3.7 ("todo debe funcionar igual en Windows y macOS").

## Consecuencias
- El entregable del paso 0.2 exige `pnpm install`, `pnpm build` y `pnpm test` en verde dentro del Dev Container en ambos sistemas operativos.
- Los builds de iOS siguen requiriendo macOS nativo (Xcode no corre en contenedor Linux), documentado como excepción conocida.

## Licencia
Rancher Desktop y Podman Desktop: Apache 2.0.
