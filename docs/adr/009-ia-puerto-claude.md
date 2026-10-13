# 009 — IA

**Estado:** Aceptado · **Fecha:** 2026-10-12

## Contexto
El producto tendrá IA; proveedor inicial Claude (respuesta del paso 0.1). La IA debe ser opcional y sustituible.

## Decisión
Definir un puerto de IA con prueba de contrato. Adaptadores: Anthropic (Claude) mediante su API y un simulado para pruebas. La clave de desarrollo vive solo en .env.local, que el usuario coloca; nunca en el código ni en el chat. En la Fase 0 solo se deja el puerto.

## Alternativas consideradas
- Adaptador compatible con OpenAI como único: ata a un formato ajeno al proveedor elegido; se agrega después si hace falta.

## Consecuencias
- Cambiar o sumar proveedores es agregar un adaptador.
- Catálogo de modelos, política por empresa, BYOK y límites quedan en la ruta de crecimiento.
- SDK de Anthropic con licencia MIT: confirmar versión al implementar.
