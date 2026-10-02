# ADR 007: Identidad — Keycloak, realm por empresa

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01). Decidido en la ronda de preguntas de `/fase0-inicio` (el prompt original dejaba esta decisión abierta).

## Contexto
Orbyta es multiempresa, cada empresa tiene su propio logo e idioma, y necesita identidad OIDC/OAuth2/SAML autogestionada on-premise (sección 5.1). Había dos formas de modelar la multiempresa en Keycloak: una organización por empresa dentro de un único realm, o un realm por empresa.

## Decisión
**Un realm de Keycloak por empresa.** Cada empresa tiene su propio realm, con sus propios clientes OIDC, tema de login (para mostrar su logo) y, a futuro, sus propios flujos de autenticación si una empresa lo requiere. La empresa activa se resuelve a partir del token OIDC (realm emisor) y viaja en el contexto de cada petición, evento y tarea (sección 5.4).

## Alternativas consideradas
- **Organizaciones de Keycloak (un solo realm):** administración centralizada y un solo conjunto de clientes, pero es una funcionalidad más nueva y con aislamiento de login/branding por empresa más limitado (el tema de login no se personaliza fácilmente por organización); exige lógica propia adicional para no mezclar datos entre organizaciones.
- **Un solo realm sin separación estructural, aislamiento solo por atributos de usuario:** más simple de administrar, pero el aislamiento depende enteramente de la lógica de aplicación, sin respaldo nativo de Keycloak; incompatible con "seguro por defecto" (sección 5.2.6).

## Consecuencias
- Alta de una empresa nueva implica crear un realm (automatizable con Terraform/OpenTofu provider de Keycloak en fases posteriores; en Fase 0 puede ser manual o script).
- El tema de login por realm permite mostrar el logo de cada empresa sin lógica adicional en la aplicación.
- La resolución de empresa en el backend se basa en el `iss` (issuer) del token, no en un parámetro enviado por el cliente.

## Licencia
Keycloak: Apache 2.0.
