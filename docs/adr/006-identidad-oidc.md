# 006 — Identidad

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
Las corporaciones exigen SSO con su proveedor (Entra ID, Google Workspace).

## Decisión
La app valida tokens OIDC y no guarda contraseñas. Perfil local: oauth2-mock-server. Perfil servidor: Keycloak con realm como código, federable con Entra ID o Google Workspace. La empresa se resuelve desde un claim del token.

## Alternativas consideradas
- Autenticación propia: riesgo de seguridad y mantenimiento.
- Servicio de identidad propietario: dependencia y costo (P5).

## Consecuencias
- SSO por cliente por configuración.
- Keycloak consume RAM: solo en CI y servidor.
- Licencias MIT (mock) y Apache 2.0 (Keycloak).
