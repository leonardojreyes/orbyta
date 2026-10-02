# Base técnica — Orbyta

> Copiado de la sección 5 de `FASE0-Orbyta.md` en el paso 0.1, con las decisiones que el prompt dejaba abiertas ya resueltas según la ronda de preguntas de `/fase0-inicio`. `CLAUDE.md` enlaza aquí en lugar de repetir este contenido (regla 3.9).

## 1. Decisiones fijas

| Tema | Decisión |
| --- | --- |
| Infraestructura | On-premise. Kubernetes portable (k3s), sin servicios gestionados de nube pública. **Estado real:** por ahora solo hay una computadora de desarrollo disponible; no hay servidores dedicados ni separación de ambientes pruebas/producción (riesgo abierto, ver `estado.md`). |
| Identidad | Keycloak autogestionado (OIDC, OAuth2, SAML). **Multiempresa: un realm por empresa** (ADR 007). |
| Código y CI/CD | GitHub + GitHub Actions con runner autohospedado on-premise para desplegar. Análisis con herramientas abiertas. **URL del repositorio: pendiente** (ver `estado.md`). |
| Equipos | Windows (con WSL2) y macOS con Dev Containers sobre Rancher Desktop o Podman Desktop (abiertos; Docker Desktop requiere licencia de pago en empresas grandes). Los builds de iOS requieren macOS. |
| Licenciamiento | Máximo código abierto (ver sección 6 de este documento). |
| IA | Modelos locales con Ollama; ningún dato sale de la infraestructura por defecto. **Disponibilidad de GPU: no confirmada** — se asumen modelos pequeños aptos para CPU (ADR 014). |

## 2. Principios de arquitectura

1. **Monolito modular** primero; un módulo se separa solo con una razón medible.
2. **Arquitectura limpia (hexagonal):** el dominio no conoce frameworks, base de datos, ERP ni IA.
3. **Multiempresa desde el día uno**, con aislamiento garantizado por Row-Level Security.
4. **Contrato primero:** OpenAPI 3.1 para web, móvil, API de terceros e integraciones.
5. **Estándares abiertos** antes que productos.
6. **Seguro por defecto:** OWASP ASVS nivel 2 (web) y MASVS (móvil).
7. **Privacidad por diseño** conforme a la LOPDP (datos de abonados).
8. **IA desacoplada y gobernada:** puerto + gateway; modelo elegible por empresa y usuario.
9. **Observable desde el inicio**, con trazas etiquetadas por empresa.
10. **Todo como código:** infraestructura, configuración y pipelines.
11. **Decisiones escritas** en ADRs; léelos antes de proponer cambios.
12. **Tecnología mayoritaria**, con soporte largo y talento disponible.

## 3. Stack y ADRs

| ADR | Decisión | Propuesta final | Fase 0 | Licencia |
| --- | --- | --- | --- | --- |
| [001](../adr/001-estilo-arquitectonico.md) | Estilo | Monolito modular + hexagonal (DDD) | Ahora | — |
| [002](../adr/002-backend.md) | Backend | **TypeScript + NestJS** (decidido) | Ahora | MIT |
| [003](../adr/003-monorepo.md) | Monorepo | Nx + pnpm | Ahora | MIT |
| [004](../adr/004-web.md) | Web | React + Next.js | Ahora | MIT |
| [005](../adr/005-movil.md) | Móvil | React Native + Expo, builds locales | Ahora | MIT |
| [006](../adr/006-base-de-datos.md) | Base de datos | PostgreSQL con RLS; operador CloudNativePG en Kubernetes | Ahora | PostgreSQL / Apache 2.0 |
| [007](../adr/007-identidad.md) | Identidad | Keycloak; **realm por empresa** (decidido) | Ahora | Apache 2.0 |
| [008](../adr/008-autorizacion.md) | Autorización | RBAC detrás de un puerto de autorización; OpenFGA cuando haya permisos finos | RBAC ahora; OpenFGA diferido | Apache 2.0 |
| [009](../adr/009-eventos.md) | Eventos | Outbox en PostgreSQL + cola BullMQ sobre Valkey | Ahora | MIT / BSD |
| [010](../adr/010-observabilidad.md) | Observabilidad | OpenTelemetry Collector + Grafana, Prometheus, Loki, Tempo | Ahora (mínimo) | Apache 2.0 / AGPL |
| [011](../adr/011-ejecucion.md) | Ejecución | Kubernetes (k3s, no existe aún) + Helm; Docker Compose en desarrollo | Ahora | Apache 2.0 |
| [012](../adr/012-iac-despliegue.md) | IaC y despliegue | OpenTofu + Helm desde GitHub Actions; Argo CD (GitOps) después | Helm ahora; Argo CD diferido | MPL 2.0 / Apache 2.0 |
| [013](../adr/013-feature-flags.md) | Feature flags | OpenFeature con proveedor de configuración local; flagd después | Mínimo ahora | Apache 2.0 |
| [014](../adr/014-ia.md) | IA | LiteLLM autogestionado frente a Ollama (solo edición abierta); dos modelos abiertos pequeños aptos para CPU (GPU no confirmada) | Ahora | MIT |
| [015](../adr/015-codigo-cicd.md) | Código y CI/CD | GitHub + GitHub Actions + runner autohospedado | Ahora | Servicio |
| [016](../adr/016-secretos.md) | Secretos | OpenBao (nodo único en Fase 0) | Ahora | MPL 2.0 |
| [017](../adr/017-archivos.md) | Archivos | Almacenamiento compatible S3 (SeaweedFS) para fotos y adjuntos | Diferido | Apache 2.0 |
| [018](../adr/018-entorno-desarrollo.md) | Entorno de desarrollo | Dev Containers | Ahora | — |
| [019](../adr/019-sistema-diseno.md) | Sistema de diseño | Tokens W3C + Style Dictionary; Tailwind + shadcn/ui; NativeWind; Storybook | Ahora | Apache 2.0 / MIT |
| [020](../adr/020-integracion-erp.md) | Integración ERP | Puerto ERP + adaptadores; **ERP = Palmera (interno), integración por vistas de base de datos**. Adaptador simulado ahora. | Puerto y adaptador simulado ahora | — |
| [021](../adr/021-movil-sin-conexion.md) | Móvil sin conexión | **Sí necesario** (confirmado): SQLite local + cola de sincronización | Decisión ahora; implementación en Fase 1 | — |

## 4. Multiempresa

- Modo **compartido**: misma base de datos, filas separadas por empresa con RLS. Base dedicada y despliegue dedicado quedan diferidos.
- La empresa se resuelve en un solo lugar (token OIDC, **emisor = realm de Keycloak de la empresa**) y viaja en el contexto de cada petición, evento y tarea.
- Cada transacción ejecuta `SET LOCAL app.tenant_id`; las políticas RLS lo exigen y el rol de la aplicación no tiene `BYPASSRLS` ni es dueño de las tablas. Las migraciones usan un rol distinto. Sin empresa, la consulta falla.
- Caché, colas y logs separados por empresa.
- Todo módulo trae pruebas que intentan leer, listar y modificar datos de otra empresa y deben fallar.
- Configuración por empresa: nombre, **logo**, idioma y modelos de IA permitidos. Los colores no son configurables por empresa.

## 5. IA local

- La IA es un **puerto del dominio**; todo pasa por LiteLLM, que expone una API compatible con OpenAI y enruta a Ollama.
- Catálogo de modelos y política por empresa (permitidos y predeterminado). El usuario elige entre los permitidos.
- Modelos elegidos: pequeños y aptos para CPU, hasta confirmar disponibilidad de GPU on-premise (ver riesgo en `estado.md`).
- Medición de tokens y latencia por empresa y usuario; registro de llamadas sin datos sensibles.
- Prompts versionados en `prompts/` y un set de evaluación con ejemplos etiquetados.
- Controles del OWASP Top 10 para LLM, en especial inyección de prompts desde textos de abonados.
- Proveedores externos: el gateway los soporta, pero están **desactivados**. Activarlos exige política de la empresa y un ADR, porque los datos salen de la infraestructura.

## 6. Integración con el ERP

- ERP de la empresa: **Palmera**, desarrollo interno. Mecanismo de integración: **vistas/tablas de base de datos**.
- Puerto `ErpPort` en `modules/integracion-erp/application`; adaptador para Palmera en `infrastructure` (vistas de base de datos), construido en Fase 1.
- Flujos previstos: abonados y proyectos desde el ERP; cierre de OS (materiales, horas, costos) hacia el ERP.
- Comunicación asíncrona por outbox con eventos CloudEvents, idempotencia y reintentos.
- En la Fase 0 solo existe un **adaptador simulado**; el real (Palmera) se construye en la Fase 1, previa definición del contrato de vistas con su equipo.

## 7. Look and feel

- **Referencia:** ClickUp. Se toman sus **patrones de interacción**, no su marca: no se copian logos, iconos, ilustraciones ni colores de ClickUp.
- **Patrones a adoptar:** barra lateral con jerarquía (empresa → proyectos), barra superior con búsqueda y paleta de comandos (Ctrl/Cmd+K), varias vistas de los mismos datos (lista y tablero en Fase 0; calendario y cronograma después), chips de estado con color, alta densidad de información, acciones rápidas y panel lateral de detalle.
- **Móvil:** pensado para el técnico de campo: botones grandes, uso con una mano, acciones principales a un toque. **Debe operar sin conexión** (confirmado).
- **Paleta y tipografía propias de Orbyta**, definidas como tokens. **Modo claro y oscuro** (confirmado).
- **Marca por empresa:** solo el logo (barra lateral, inicio de sesión y app móvil).
- Ningún valor visual se escribe a mano en una pantalla: todo sale de los tokens. Contraste WCAG 2.2 AA verificado en ambos temas.
- Español de Ecuador por defecto, con textos externalizados.

## 8. Context engineering

**Estructura del repositorio:**

```
orbyta/
├── CLAUDE.md
├── FASE0-Orbyta.md
├── .claude/ (settings.json, hooks/, agents/, commands/, skills/)
├── .devcontainer/
├── apps/ (api, worker, web, mobile)
├── modules/<modulo>/ (domain, application, infrastructure, interface)
├── platform/ (tenancy, auth, ia-gateway, observabilidad)
├── packages/ (contracts, ui, tokens)
├── prompts/
├── infra/ (helm, tofu)
└── docs/ (fase0, adr, architecture, specs, security, design)
```

**Hooks de Claude Code** (scripts Node en `.claude/hooks/`, registrados en `.claude/settings.json`):

- `PreToolUse` sobre Edit/Write: bloquear `.env*`, migraciones ya aplicadas e `infra/` de producción.
- `PreToolUse` sobre Bash: bloquear comandos destructivos (`rm -rf`, `git push --force`, `kubectl` contra producción).
- `PostToolUse` sobre Edit/Write: formatear y lint del archivo tocado.
- `Stop`: pruebas afectadas (`nx affected -t test`) y escaneo de secretos.

**Flujo por funcionalidad:** `/spec` → `/plan` → `/tasks` → `/implement` (una tarea por sesión, pruebas primero) → `/review` (subagentes en paralelo) → PR con controles en verde y aprobación humana.

## 9. Subagentes y comandos

| Subagente | Responsabilidad | Herramientas |
| --- | --- | --- |
| arquitecto | Arquitectura limpia, límites entre módulos, coherencia con ADRs | Solo lectura |
| revisor-multiempresa | Ningún cruce de datos entre empresas | Solo lectura |
| revisor-seguridad | ASVS, MASVS, OWASP LLM, secretos, dependencias, licencias | Solo lectura + escáneres |
| ingeniero-pruebas | Pruebas unitarias, de integración y de aislamiento | Escritura solo en pruebas |
| auditor-accesibilidad | WCAG 2.2 AA y coherencia con el sistema de diseño | Solo lectura + axe |
| revisor-cumplimiento | LOPDP: datos personales de abonados | Solo lectura |
| documentador | ADRs, OpenAPI, README | Escritura solo en `docs/` |

Comandos en `.claude/commands/`: `fase0-inicio` (creado en el paso 0.1), `spec`, `plan`, `tasks`, `implement`, `review`, `adr` (pendientes de los pasos siguientes). Cada archivo define rol, contexto a leer, pasos, formato de salida y criterio de terminado.

## 10. Regla de licencias

Se prefieren MIT, Apache 2.0, BSD o MPL. AGPL solo para componentes usados sin modificar como servicio aparte (Grafana, Loki, Tempo). BSL, SSPL o "source-available" requieren ADR de excepción. CI verifica las licencias de dependencias nuevas.
