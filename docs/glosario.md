<!-- Una línea por término. El nombre en código es el que se usa en entidades, tablas y endpoints. -->
# Glosario

| Término | Nombre en código | Definición |
| --- | --- | --- |
| Empresa | `empresa` | Cliente que usa la plataforma; unidad de aislamiento de datos |
| Usuario | `usuario` | Persona que inicia sesión por OIDC y pertenece a una empresa |
| Rol | `rol` | Conjunto de permisos asignado a un usuario dentro de una empresa (RBAC) |
| Perfil | `perfil` | Modo de ejecución (`local` o `servidor`) elegido con `PERFIL` |
| Puerto | `puerto` | Interfaz del dominio hacia algo externo; vive en `platform/<puerto>/` |
| Adaptador | `adaptador` | Implementación concreta de un puerto; debe pasar su prueba de contrato |
| Módulo | `modulo` | Unidad de negocio en `modules/<m>/` con cuatro capas |
| ADR | `adr` | Registro corto de una decisión de arquitectura |
