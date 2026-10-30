# Roadmap de Orbyta

Cada paso = una sesión de Claude Code que termina con algo visible en pantalla.

## Fase 1 · MVP web (en curso)
- [x] 1.1 Esqueleto: monorepo, PostgreSQL con RLS multiempresa, proyectos con tablero Kanban, órdenes de servicio
- [x] 1.2 Detalle de orden de servicio (panel lateral: editar datos, historial de cambios de estado)
- [x] 1.3 Catálogos: clientes y técnicos (skill `nuevo-modulo`); orden de servicio referencia cliente y técnico
- [x] 1.4 Vincular órdenes a proyectos y ver órdenes dentro del proyecto
- [ ] 1.5 Logo por empresa y datos de empresa
- [ ] 1.6 Autenticación local (usuarios, login, roles básicos: admin, supervisor, técnico) — la empresa sale de la sesión, no del header

## Fase 2 · Operación
- [ ] Bitácora/auditoría (tabla `audit_log` vía trigger)
- [ ] Adjuntos (fotos de la falla) en disco local / S3 compatible (MinIO en servidor)
- [ ] Filtros, búsqueda y paginación; vista lista tipo ClickUp
- [ ] Panel de indicadores (órdenes por estado, tiempos de atención)

## Fase 3 · Sincronización (prepara el móvil offline)
- [ ] Endpoint `GET /api/sync?since=` (cambios por `updated_at`, incluye borrados lógicos) y `POST /api/sync` (lote de cambios del cliente)
- [ ] Reglas de conflicto (última escritura gana por campo; estado de la orden con reglas de transición)

## Fase 4 · App móvil del técnico (Expo)
- [ ] `apps/mobile` con Expo; pruebas con Expo Go en el teléfono (sin Xcode ni Android Studio)
- [ ] Mis órdenes del día, cambio de estado, fotos, firma del cliente, GPS
- [ ] Base local expo-sqlite + sincronización de la fase 3 → funciona sin conexión
- [ ] Compilación de iOS/Android en la nube con EAS Build

## Fase 5 · Empresarial (requiere servidor, no la Mac)
- [ ] Keycloak (OIDC): empresa y roles desde el token
- [ ] Integración ERP (API/colas), IA local con Ollama detrás de una interfaz de proveedor intercambiable
- [ ] Despliegue on-premise con Docker Compose / Kubernetes, backups, observabilidad
