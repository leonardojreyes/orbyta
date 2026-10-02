# ADR 013: Feature flags — OpenFeature con proveedor local; flagd diferido

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta necesita poder activar/desactivar funcionalidad de forma controlada (p. ej. proveedores de IA externos, que están desactivados por defecto según la sección 5.5), sin depender de un servicio gestionado de nube.

## Decisión
**OpenFeature** como estándar/API de feature flags, con un **proveedor de configuración local** (archivo o variables de entorno) en Fase 0. **flagd** (servidor de flags dinámico) se adopta después, cuando se necesite cambiar flags sin redesplegar.

## Alternativas consideradas
- **flagd desde el inicio:** permite cambiar flags en caliente, pero añade un servicio más a operar sin que Fase 0 tenga un caso de uso que lo requiera (los flags conocidos, como proveedores de IA externos, cambian por ADR, no en caliente).
- **Flags hardcodeados sin OpenFeature:** más rápido al inicio, pero acopla el código a la implementación concreta y complica adoptar flagd después sin reescritura.

## Consecuencias
- El código de negocio consulta flags a través de la API de OpenFeature, nunca variables de entorno directamente, para poder cambiar de proveedor sin tocar el dominio.
- Activar un proveedor de IA externo sigue requiriendo, además del flag, la política de empresa y el ADR de excepción (sección 5.5).

## Licencia
OpenFeature: Apache 2.0.
