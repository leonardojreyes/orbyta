# Ruta de crecimiento

Nada de esto se construye en la Fase 0.

| Disparador | Qué se agrega |
| --- | --- |
| Primera funcionalidad móvil | App React Native + Expo (Expo Go en teléfono; compilación nativa en CI) |
| Primera funcionalidad con IA | Catálogo de modelos, política por empresa, BYOK, límites y medición; LiteLLM si hay varios proveedores |
| Más de un servidor o alta disponibilidad | Kubernetes + Helm (+ OpenTofu y Argo CD) |
| Permisos que no caben en RBAC | OpenFGA |
| Volumen de tareas que satura PostgreSQL (medido) | Valkey o NATS |
| Cliente que exige gestión de secretos | OpenBao |
| Operación con varios clientes en producción | OpenTelemetry con Grafana, Loki y Tempo |
| Cliente regulado o banco | Despliegue dedicado, HSM, SBOM, ASVS nivel 2 completo, paquete de due diligence |
