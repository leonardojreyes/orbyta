---
paths:
  - "apps/api/**"
  - "modules/*/application/**"
  - "modules/*/infrastructure/**"
  - "platform/**"
---
# Backend
- Casos de uso en `application/`, un archivo por caso de uso; dependen de puertos, no de adaptadores.
- Los adaptadores viven en `infrastructure/` o en `platform/<puerto>/adapters/<perfil>/`.
- La selección de adaptadores ocurre solo en la raíz de composición (`apps/api`), según `PERFIL`.
- Un adaptador nuevo debe pasar la prueba de contrato del puerto (`contract.test.ts`).
- Configuración validada con esquema al arrancar; nunca leas `process.env` fuera de `apps/api/config`.
- Logs en JSON con `empresaId` y `requestId`; nunca registres datos personales.
