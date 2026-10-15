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

## Precisión (2026-10-15, paso 0.4.6b)
- Contrato de claims que consume el adaptador OIDC: `sub`, `empresa_id` (UUID), `roles` (arreglo plano) y `aud = orbyta-api`. En Keycloak salen de protocol mappers (atributo de usuario, rol de realm y audience); no se lee `realm_access.roles`.
- El realm vive en `deploy/keycloak/orbyta-realm.json` y la imagen se fija por digest en el job `keycloak` de `ci.yml`. Ese realm es solo para CI (`sslRequired: none`, password grant, contraseñas de prueba); producción define el suyo en el paso 0.6.
- Una sola prueba e2e (`apps/api/src/e2e`) corre contra oauth2-mock-server en local y contra Keycloak en CI (`OIDC_E2E_KEYCLOAK_URL`).
