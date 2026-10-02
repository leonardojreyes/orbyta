# Spec: ping

> Módulo **temporal** de verificación del paso 0.3 (capa de context engineering). Se elimina al terminar la prueba. No forma parte del mapa de módulos de negocio.

## Objetivo

Comprobar que el flujo `/spec` → `/plan` → `/implement` produce un módulo con sus cuatro capas que pasa lint, límites de Nx y pruebas sin correcciones manuales.

## Alcance

- Una operación "hacer ping" que, para una empresa dada, responde "pong" junto con la fecha y hora del sistema.
- La empresa es obligatoria.

## Fuera de alcance

- Persistencia, eventos, autenticación real, endpoint HTTP en `apps/api`, interfaz web o móvil.
- Cualquier dato de abonados u otra información personal.

## Actores y roles

- **Cualquier usuario autenticado de una empresa** (el rol no cambia el resultado). La empresa proviene del contexto, no de datos de entrada libres.

## Reglas de negocio

1. Un ping solo es válido si se identifica la **empresa** que lo emite.
2. La respuesta es siempre el mensaje `pong`, la empresa que lo originó y el instante de respuesta.
3. El instante proviene de una fuente de tiempo reemplazable (no se lee el reloj directamente en el dominio), para que sea verificable en pruebas.

## Impacto multiempresa

- La respuesta contiene únicamente la empresa solicitante; nunca información de otra empresa.
- Sin empresa, la operación falla (regla general: una consulta sin empresa falla).

## Datos personales

Ninguno. Solo identificador de empresa y marca de tiempo.

## Criterios de aceptación

- **CA-1:** Dada la empresa "A", hacer ping devuelve mensaje `pong`, empresa "A" y el instante indicado por la fuente de tiempo.
- **CA-2:** Hacer ping sin empresa (vacía, en blanco o ausente) falla con un error de validación y no devuelve respuesta.
- **CA-3:** Dos pings consecutivos de las empresas "A" y "B" devuelven cada uno su propia empresa, sin mezclar valores.
- **CA-4:** El instante de la respuesta es el que entrega la fuente de tiempo; con una fuente simulada fija, el resultado es determinista.
- **CA-5:** El módulo respeta los límites de capas: ninguna capa importa una capa prohibida y el lint de Nx lo comprueba.

## Preguntas abiertas

Ninguna.
