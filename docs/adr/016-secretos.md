# ADR 016: Secretos — OpenBao (nodo único en Fase 0)

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta nunca debe tener secretos en el código (regla 3.5). Necesita un almacén de secretos on-premise para credenciales de base de datos, Keycloak, LiteLLM, etc.

## Decisión
**OpenBao** (fork abierto de HashiCorp Vault) como almacén de secretos, desplegado como **nodo único** en Fase 0 (sin alta disponibilidad todavía).

## Alternativas consideradas
- **HashiCorp Vault:** funcionalmente equivalente, pero su licencia BSL no cumple la regla de licencias (sección 5.10) sin ADR de excepción; OpenBao es el fork con licencia abierta.
- **Secretos de Kubernetes nativos (Secrets) sin almacén dedicado:** más simple, pero sin rotación, auditoría ni políticas de acceso finas; no cumple "seguro por defecto" para credenciales sensibles (DB, ERP, IA).

## Consecuencias
- Alta disponibilidad de OpenBao queda fuera de alcance de Fase 0 (nodo único es un punto único de falla, aceptado temporalmente y registrado como riesgo).
- Los hooks `PreToolUse` (paso 0.3) bloquean además la edición/lectura de `.env*` como defensa adicional en el repositorio.

## Licencia
OpenBao: MPL 2.0.
