# Keycloak (realm como código)

`orbyta-realm.json` se importa al arrancar Keycloak (`start-dev --import-realm`). Solo para CI y pruebas:
las contraseñas de los usuarios de prueba no son secretos y `sslRequired` está en `none`.

- Claims que consume `platform/identidad` (adaptador OIDC): `sub`, `empresa_id` (UUID), `roles` (arreglo plano) y `aud = orbyta-api`.
- Usuarios: `ana@empresa-a.test` (empresa `1111…`) y `beto@empresa-b.test` (empresa `2222…`); los UUID coinciden con
  `apps/api/src/e2e/dos-empresas.e2e.test.ts`.
- Imagen: se fija por digest en `.github/workflows/ci.yml` (`quay.io/keycloak/keycloak@sha256:…`, tag en el comentario).
  Para actualizarla, resuelve el digest del nuevo tag en quay.io y cámbialo junto con el comentario.
- Producción (paso 0.6) no reutiliza este realm: define sus propios clientes, usuarios y TLS.
