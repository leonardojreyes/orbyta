---
paths:
  - "packages/contracts/**"
  - "modules/*/interface/**"
---
# Contratos de API
- El contrato OpenAPI 3.1 se edita primero; el código se adapta al contrato, no al revés.
- Después de cambiar el contrato, regenera el cliente (`pnpm --filter contracts generar`).
- Cambios incompatibles requieren nueva versión de ruta (`/v2`) y un ADR.
- Errores con formato Problem Details (RFC 9457).
- DTOs de entrada validados; nunca expongas entidades del dominio directamente.
