# Deuda planificada — Fase 0 Orbyta

> Todo lo que se decide **no hacer ahora**, con su ADR y el disparador que obliga a retomarlo. Registrado en el paso 0.1 y actualizado en cada paso siguiente.

| # | Ítem diferido | ADR | Disparador para retomarlo |
| --- | --- | --- | --- |
| 1 | OpenFGA (permisos finos por recurso) | [008](../adr/008-autorizacion.md) | Cuando exista un requisito real de permisos por recurso o jerarquía que RBAC no pueda expresar. |
| 2 | Argo CD (GitOps) | [012](../adr/012-iac-despliegue.md) | Cuando exista separación real de ambientes y/o el número de despliegues manuales vía GitHub Actions se vuelva difícil de trazar. |
| 3 | flagd (feature flags dinámicos) | [013](../adr/013-feature-flags.md) | Cuando se necesite cambiar un flag sin redesplegar (p. ej. apagar una funcionalidad en caliente ante un incidente). |
| 4 | Almacenamiento de archivos (SeaweedFS) | [017](../adr/017-archivos.md) | Cuando una historia de usuario requiera adjuntar fotos/archivos a una orden de servicio. |
| 5 | Modelos de IA más grandes en Ollama | [014](../adr/014-ia.md) | Cuando se confirme disponibilidad de GPU on-premise (pendiente, ver `estado.md`) y el set de evaluación muestre que los modelos pequeños no alcanzan la precisión necesaria. |
| 6 | Adaptador real de integración con Palmera (vistas de base de datos) | [020](../adr/020-integracion-erp.md) | Antes de Fase 1: definir con el equipo de Palmera qué vistas existen/se crean, periodicidad y mecanismo de escritura (cierre de OS). |
| 7 | Cola de sincronización offline y resolución de conflictos (móvil) | [021](../adr/021-movil-sin-conexion.md) | Antes de que los técnicos usen la app en campo real sin señal. |
| 8 | OpenFGA, base y despliegue dedicados por empresa, SCIM, flagd, credenciales OAuth2 client credentials para API de terceros | — (paso 0.6) | Cuando una empresa lo exija contractualmente (base/despliegue dedicados) o cuando exista un consumidor real de la API de terceros (client credentials). |
| 9 | vLLM para mayor carga, herramientas MCP, proveedores de IA externos | [014](../adr/014-ia.md) (paso 0.7) | Cuando el volumen de clasificaciones supere lo que Ollama/LiteLLM sostienen, o una empresa apruebe política + ADR de excepción para usar un proveedor externo. |
| 10 | Argo CD, alta disponibilidad, almacenamiento S3 (infraestructura) | [011](../adr/011-ejecucion.md), [012](../adr/012-iac-despliegue.md), [017](../adr/017-archivos.md) (paso 0.8) | Cuando haya más de un ambiente real y/o carga que justifique alta disponibilidad. |
| 11 | Pruebas de extremo a extremo completas | — (paso 0.4) | Cuando exista el esqueleto caminante completo (fin de Fase 0) para cubrirlo con e2e reales. |
| 12 | Vistas de calendario y cronograma; diseño en Penpot | — (paso 0.5) | Cuando `proyectos` o la planificación de OS requieran esas vistas (fuera del esqueleto caminante de Fase 0). |
| 13 | Prueba de penetración externa | — (paso 0.9) | Antes de un despliegue a producción con datos reales de abonados. |
| 14 | Infraestructura on-premise real (servidores dedicados, separación pruebas/producción) | [011](../adr/011-ejecucion.md) | Antes de cerrar el paso 0.8; por ahora solo se dispone de la computadora de desarrollo (ver riesgo en `estado.md`). |
| 15 | Corregir `node-forge` y `uuid` 7.x/8.x (excepciones de OSV-Scanner en `osv-scanner.toml`) | [022](../adr/022-pipeline-calidad.md) (paso 0.4) | Antes del 2026-12-31 o cuando Expo publique versiones corregidas. |
| 16 | Versión del logo de Orbyta para tema oscuro y logo definitivo por empresa (carga desde la configuración por empresa) | [023](../adr/023-implementacion-sistema-diseno.md) (paso 0.5) | Logo por empresa: paso 0.6 (configuración por empresa). Versión oscura: cuando diseño la entregue. |
| 17 | Migrar a Tailwind 4 | [023](../adr/023-implementacion-sistema-diseno.md) (paso 0.5) | Cuando NativeWind 5 sea estable. |
| 18 | Pruebas de las pantallas móviles en simulador/dispositivo (Detox o Maestro) | [023](../adr/023-implementacion-sistema-diseno.md) (paso 0.5) | Cuando exista un build móvil distribuible (paso 0.8). |
