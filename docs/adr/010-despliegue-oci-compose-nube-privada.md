# 010 — Despliegue

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Primer despliegue en una nube privada (respuesta del paso 0.1); el mismo paquete debe instalarse luego en el cliente.

## Decisión
Imágenes OCI y Docker Compose en un servidor Linux de la nube privada (mínimo 2 vCPU, 4 GB de RAM). Despliegue desde GitHub Actions con aprobación.

## Alternativas consideradas
- Kubernetes: excesivo para un servidor; queda en la ruta de crecimiento.

## Consecuencias
- Recreación del servidor con un comando; mismo paquete para el cliente.
- Pendiente: confirmar con el proveedor de la nube privada acceso, red y respaldos.
- Licencia Apache 2.0.
