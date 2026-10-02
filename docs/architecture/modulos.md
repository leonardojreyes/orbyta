# Mapa de módulos — Orbyta

> Validado en el paso 0.1 (ADR 001: monolito modular + hexagonal). Cada módulo vive en `modules/<modulo>/` con cuatro capas: `domain`, `application`, `infrastructure`, `interface`. El dominio no conoce frameworks, base de datos, ERP ni IA (principio 5.2.2).

## Módulos de la Fase 0 en adelante

| Módulo | Responsabilidad | Notas de Fase 0 |
| --- | --- | --- |
| `proyectos` | Gestión de proyectos, tareas e hitos (construcción/instalación). | No se implementa en Fase 0 (fuera del esqueleto caminante, sección 7); solo se reserva el espacio en el mapa. |
| `contratos` | Acuerdos con el cliente que habilitan un conjunto de órdenes de servicio con precios por tipo de orden durante un periodo. **Agregado en el paso 0.1** a partir de la validación con el usuario. | No se implementa en Fase 0; se registra como módulo candidato y se relaciona con `ordenes-servicio` (una OS puede consumir/facturarse contra un contrato). |
| `ordenes-servicio` | Ciclo de vida de la orden de servicio: crear, listar, ver detalle, cambiar de estado; clasificación de tipo de falla vía IA; evento `os.cerrada`. | **Único módulo de negocio implementado en la Fase 0** (paso 0.2 en adelante), por ser el núcleo del esqueleto caminante. |
| `abonados` | Clientes finales y sus puntos de servicio. | No se implementa en Fase 0; una OS de Fase 0 referencia un abonado de forma simplificada (sin módulo propio todavía). |
| `personal` | Técnicos y cuadrillas. | No se implementa en Fase 0. |
| `integracion-erp` | Puerto `ErpPort` + adaptadores hacia el ERP de la empresa (Palmera: integración por vistas de base de datos, ADR 020). | En Fase 0 solo existe el **adaptador simulado** que consume `os.cerrada` del outbox. |

## Plataforma transversal (no son módulos de negocio)

Viven en `platform/`, no en `modules/`, porque no tienen reglas de negocio propias:

- **tenancy**: resolución de empresa (realm Keycloak → contexto de empresa), RLS.
- **auth**: integración con Keycloak, puerto de autorización (RBAC, ADR 008).
- **ia-gateway**: puerto de IA hacia LiteLLM/Ollama (ADR 014).
- **observabilidad**: instrumentación OpenTelemetry común a api/worker/web.

## Dependencias permitidas (reglas de límites de Nx, paso 0.2)

- `domain` no importa nada de `application`, `infrastructure`, `interface`, ni de `platform/*`.
- `application` importa `domain` del mismo módulo; puede depender de **puertos** definidos en `platform/*` (nunca de su implementación concreta).
- `infrastructure` implementa los puertos de `application` y es la única capa que puede importar frameworks, drivers de base de datos, SDKs de Keycloak/LiteLLM/ERP.
- `interface` (controladores HTTP, resolvers, etc.) depende de `application`, nunca de `infrastructure` directamente.
- Ningún módulo de negocio importa directamente de otro módulo de negocio; la comunicación entre módulos es por eventos (outbox, ADR 009) o por puertos explícitos.

## Cambios respecto a la propuesta inicial del prompt
- Se agrega `contratos` a los módulos candidatos, a partir de la respuesta del usuario en la ronda de preguntas de `/fase0-inicio`.
