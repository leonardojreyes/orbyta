# FASE 0 — Orbyta · Prompt para Claude Code

> Generado con el skill `fase0-producto-synaptech` v1.0 · 2026-10-01 · SynapTech Ecuador

## 1. Rol y objetivo

Actúa como arquitecto de software y líder técnico de SynapTech. Tu objetivo es ejecutar la **Fase 0 de Orbyta**: dejar listos el ambiente, la arquitectura y un esqueleto caminante en web y móvil sobre el que después se construirán las funcionalidades.

En la Fase 0 no se desarrollan funcionalidades de negocio, salvo la orden de servicio mínima que usa el esqueleto.

**Plazo.** El producto tiene un horizonte de un mes. La Fase 0 tiene un tope de **8 días hábiles**. Cada paso separa:

- **Ahora:** obligatorio en la Fase 0.
- **Diferido:** no se hace ahora; se registra en `docs/fase0/deuda-planificada.md` con su ADR y el disparador que obliga a retomarlo.

No amplíes el alcance sin aprobación explícita.

## 2. Contexto del producto

- **Qué es:** plataforma para gestionar **proyectos** y **órdenes de servicio** en empresas de servicios. Ejemplo: una empresa construye la red de agua potable de una ciudadela (proyecto) y luego atiende los reclamos de los abonados por fallas en el servicio (órdenes de servicio).
- **Clientes:** empresas medianas y grandes del Ecuador. No se prevén clientes regulados en esta versión.
- **Canales:** web, móvil (iOS y Android) y API para terceros.
- **Multiempresa:** sí. Cada empresa tiene su propio **logo**; el resto del look and feel es común.
- **IA embebida:** sí, con **modelos locales vía Ollama**.
- **Integración obligatoria:** ERP de cada empresa (cuál, por definir).
- **Look and feel:** referencia ClickUp.
- **Despliegue:** on-premise en esta versión.
- **Equipo:** desarrolladores con Windows y macOS.

**Módulos candidatos** (valídalos en 0.1): `proyectos`, `ordenes-servicio`, `abonados` (clientes y puntos de servicio), `personal` (técnicos y cuadrillas), `integracion-erp`.

**Glosario inicial** (valídalo en 0.1): Proyecto, Tarea, Hito, Orden de servicio (OS), Abonado, Punto de servicio, Técnico, Cuadrilla, Tipo de falla, Estado de la OS, SLA.

## 3. Reglas de trabajo

1. Trabaja **un paso a la vez**. Al iniciar un paso, entra en modo plan, presenta el plan del paso y espera "adelante". Al terminarlo, entrega el reporte de la sección 8 y espera **"aprobado"** antes de pasar al siguiente.
2. Mantén `docs/fase0/estado.md` con: paso actual, decisiones, pendientes y próximo paso. Actualízalo al cerrar cada paso y antes de terminar cada sesión. **Al iniciar cualquier sesión, léelo antes que nada.**
3. Registra cada decisión como ADR en `docs/adr/NNN-titulo.md` (contexto, decisión, alternativas, consecuencias, licencia).
4. Si falta información, **pregunta; no supongas**.
5. **Nunca:** commits directos a `main`; secretos en el código; dependencias con licencia no permitida sin ADR de excepción; comandos destructivos o contra producción sin aprobación.
6. Trabaja en ramas `fase0/<paso>` y entrega cada paso como pull request. Única excepción: el commit inicial del paso 0.2, que crea `main` con los documentos del paso 0.1. Hasta que la protección de `main` exista (paso 0.4), respeta igual esta regla.
7. Todo debe funcionar igual en **Windows y macOS**: scripts en Node (scripts de `package.json`), nunca en bash; rutas con `path`; finales de línea normalizados.
8. Antes de agregar una dependencia, verifica su licencia según la sección 5.10.
9. Mantén `CLAUDE.md` en máximo 150 líneas; el detalle vive en `docs/`.

## 4. Preguntas de arranque (`/fase0-inicio`)

Crea `.claude/commands/fase0-inicio.md` y ejecútalo como primera acción del paso 0.1. Haz estas preguntas en una sola ronda y registra las respuestas en `estado.md` y en los ADRs correspondientes:

1. **Lenguaje del backend:** TypeScript + NestJS (recomendado: comparte tipos con web y móvil y acorta el plazo), Java/Spring Boot o .NET. Presenta pros y contras en tres líneas cada uno.
2. **ERP:** cuál o cuáles, y qué mecanismo de integración ofrecen (API REST/SOAP, vistas de base de datos, archivos, cola de mensajes).
3. **Infraestructura on-premise:** servidores disponibles, si hay ambientes separados de pruebas y producción, si ya hay Kubernetes (k3s, RKE2, OpenShift u otro) o hay que instalarlo, y si hay GPU para Ollama.
4. **Trabajo en campo:** ¿los técnicos trabajan sin señal? ¿La app móvil debe operar sin conexión?
5. **Tema visual:** modo claro, oscuro o ambos (supuesto: ambos).
6. **Revisores humanos:** quiénes aprueban pull requests y ADRs.
7. **Repositorio:** URL del repositorio vacío en GitHub (organización de SynapTech) y confirmación de que la CLI `gh` está autenticada en este equipo.

## 5. Base técnica

> **En el paso 0.1, guarda esta sección completa en `docs/fase0/base-tecnica.md`.** Desde entonces, `CLAUDE.md` enlaza a ese archivo en lugar de repetirlo.

### 5.1 Decisiones fijas

| Tema | Decisión |
| --- | --- |
| Infraestructura | On-premise. Kubernetes portable, sin servicios gestionados de nube pública. |
| Identidad | Keycloak autogestionado (OIDC, OAuth2, SAML). |
| Código y CI/CD | GitHub + GitHub Actions con runner autohospedado on-premise para desplegar. Análisis con herramientas abiertas. |
| Equipos | Windows (con WSL2) y macOS con Dev Containers sobre Rancher Desktop o Podman Desktop (abiertos; Docker Desktop requiere licencia de pago en empresas grandes). Los builds de iOS requieren macOS. |
| Licenciamiento | Máximo código abierto (5.10). |
| IA | Modelos locales con Ollama; ningún dato sale de la infraestructura por defecto. |

### 5.2 Principios de arquitectura

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

### 5.3 Stack y ADRs

| ADR | Decisión | Propuesta | Fase 0 | Licencia |
| --- | --- | --- | --- | --- |
| 001 | Estilo | Monolito modular + hexagonal (DDD) | Ahora | — |
| 002 | Backend | Según `/fase0-inicio`; recomendado TypeScript + NestJS | Ahora | MIT |
| 003 | Monorepo | Nx + pnpm | Ahora | MIT |
| 004 | Web | React + Next.js | Ahora | MIT |
| 005 | Móvil | React Native + Expo, builds locales (sin servicio de build en la nube) | Ahora | MIT |
| 006 | Base de datos | PostgreSQL con RLS; operador CloudNativePG en Kubernetes | Ahora | PostgreSQL / Apache 2.0 |
| 007 | Identidad | Keycloak; una organización de Keycloak por empresa o un realm por empresa (decidir) | Ahora | Apache 2.0 |
| 008 | Autorización | RBAC detrás de un puerto de autorización; OpenFGA cuando haya permisos finos | RBAC ahora; OpenFGA diferido | Apache 2.0 |
| 009 | Eventos | Outbox en PostgreSQL + cola BullMQ sobre Valkey | Ahora | MIT / BSD |
| 010 | Observabilidad | OpenTelemetry Collector + Grafana, Prometheus, Loki, Tempo | Ahora (mínimo) | Apache 2.0 / AGPL |
| 011 | Ejecución | Kubernetes (k3s si no existe) + Helm; Docker Compose en desarrollo | Ahora | Apache 2.0 |
| 012 | IaC y despliegue | OpenTofu + Helm desde GitHub Actions; Argo CD (GitOps) después | Helm ahora; Argo CD diferido | MPL 2.0 / Apache 2.0 |
| 013 | Feature flags | OpenFeature con proveedor de configuración local; flagd después | Mínimo ahora | Apache 2.0 |
| 014 | IA | LiteLLM autogestionado frente a Ollama (solo la edición abierta, sin módulos enterprise); dos modelos abiertos pequeños según el hardware | Ahora | MIT |
| 015 | Código y CI/CD | GitHub + GitHub Actions + runner autohospedado | Ahora | Servicio |
| 016 | Secretos | OpenBao (nodo único en Fase 0) | Ahora | MPL 2.0 |
| 017 | Archivos | Almacenamiento compatible S3 (SeaweedFS) para fotos y adjuntos | Diferido | Apache 2.0 |
| 018 | Entorno de desarrollo | Dev Containers | Ahora | — |
| 019 | Sistema de diseño | Tokens W3C + Style Dictionary; Tailwind + shadcn/ui; NativeWind; Storybook | Ahora | Apache 2.0 / MIT |
| 020 | Integración ERP | Puerto ERP + adaptadores; eventos vía outbox | Puerto y adaptador simulado ahora | — |
| 021 | Móvil sin conexión | Según respuesta 4: SQLite local + cola de sincronización | Decisión ahora; implementación en Fase 1 | — |

### 5.4 Multiempresa

- Modo **compartido**: misma base de datos, filas separadas por empresa con RLS. Base dedicada y despliegue dedicado quedan diferidos.
- La empresa se resuelve en un solo lugar (token OIDC) y viaja en el contexto de cada petición, evento y tarea.
- Cada transacción ejecuta `SET LOCAL app.tenant_id`; las políticas RLS lo exigen y el rol de la aplicación no tiene `BYPASSRLS` ni es dueño de las tablas. Las migraciones usan un rol distinto. Sin empresa, la consulta falla.
- Caché, colas y logs separados por empresa.
- Todo módulo trae pruebas que intentan leer, listar y modificar datos de otra empresa y deben fallar.
- Configuración por empresa: nombre, **logo**, idioma y modelos de IA permitidos. Los colores no son configurables por empresa.

### 5.5 IA local

- La IA es un **puerto del dominio**; todo pasa por LiteLLM, que expone una API compatible con OpenAI y enruta a Ollama.
- Catálogo de modelos y política por empresa (permitidos y predeterminado). El usuario elige entre los permitidos.
- Medición de tokens y latencia por empresa y usuario; registro de llamadas sin datos sensibles.
- Prompts versionados en `prompts/` y un set de evaluación con ejemplos etiquetados.
- Controles del OWASP Top 10 para LLM, en especial inyección de prompts desde textos de abonados.
- Proveedores externos: el gateway los soporta, pero están **desactivados**. Activarlos exige política de la empresa y un ADR, porque los datos salen de la infraestructura.

### 5.6 Integración con el ERP

- Puerto `ErpPort` en `modules/integracion-erp/application`; un adaptador por ERP en `infrastructure`.
- Flujos previstos (validar en 0.1): abonados y proyectos desde el ERP; cierre de OS (materiales, horas, costos) hacia el ERP.
- Comunicación asíncrona por outbox con eventos CloudEvents, idempotencia y reintentos.
- En la Fase 0 solo existe un **adaptador simulado**; el real se construye en la Fase 1.

### 5.7 Look and feel

- **Referencia:** ClickUp. Se toman sus **patrones de interacción**, no su marca: no se copian logos, iconos, ilustraciones ni colores de ClickUp.
- **Patrones a adoptar:** barra lateral con jerarquía (empresa → proyectos), barra superior con búsqueda y paleta de comandos (Ctrl/Cmd+K), varias vistas de los mismos datos (lista y tablero en Fase 0; calendario y cronograma después), chips de estado con color, alta densidad de información, acciones rápidas y panel lateral de detalle.
- **Móvil:** pensado para el técnico de campo: botones grandes, uso con una mano, acciones principales a un toque.
- **Paleta y tipografía propias de Orbyta**, definidas como tokens. Modo claro y oscuro (supuesto, confirmar en `/fase0-inicio`).
- **Marca por empresa:** solo el logo (barra lateral, inicio de sesión y app móvil).
- Ningún valor visual se escribe a mano en una pantalla: todo sale de los tokens. Contraste WCAG 2.2 AA verificado en ambos temas.
- Español de Ecuador por defecto, con textos externalizados.

### 5.8 Context engineering

**Estructura del repositorio:**

```
orbyta/
├── CLAUDE.md
├── FASE0.md
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

### 5.9 Subagentes y comandos

| Subagente | Responsabilidad | Herramientas |
| --- | --- | --- |
| arquitecto | Arquitectura limpia, límites entre módulos, coherencia con ADRs | Solo lectura |
| revisor-multiempresa | Ningún cruce de datos entre empresas | Solo lectura |
| revisor-seguridad | ASVS, MASVS, OWASP LLM, secretos, dependencias, licencias | Solo lectura + escáneres |
| ingeniero-pruebas | Pruebas unitarias, de integración y de aislamiento | Escritura solo en pruebas |
| auditor-accesibilidad | WCAG 2.2 AA y coherencia con el sistema de diseño | Solo lectura + axe |
| revisor-cumplimiento | LOPDP: datos personales de abonados | Solo lectura |
| documentador | ADRs, OpenAPI, README | Escritura solo en `docs/` |

Comandos en `.claude/commands/`: `fase0-inicio`, `spec`, `plan`, `tasks`, `implement`, `review`, `adr`. Cada archivo define rol, contexto a leer, pasos, formato de salida y criterio de terminado.

### 5.10 Regla de licencias

Se prefieren MIT, Apache 2.0, BSD o MPL. AGPL solo para componentes usados sin modificar como servicio aparte (Grafana, Loki, Tempo). BSL, SSPL o "source-available" requieren ADR de excepción. CI verifica las licencias de dependencias nuevas.

## 6. Pasos de la Fase 0

### 0.1 Decisiones fundacionales — 1 día

- **Ahora:** ejecuta `/fase0-inicio`. Crea `docs/fase0/estado.md`, `base-tecnica.md`, `deuda-planificada.md` y `glosario.md`. Redacta los ADRs 001–021. Dibuja el mapa de módulos en `docs/architecture/modulos.md`.
- **Entregable:** ADRs aprobados por los revisores.

### 0.2 Repositorio y esqueleto — 0,5 días

- **Ahora:** monorepo Nx + pnpm; `.devcontainer/` (Node LTS, pnpm, acceso al motor de contenedores; probado con Rancher Desktop o Podman Desktop en Windows con WSL2 y en macOS); `.gitattributes` con `* text=auto eol=lf`; `.editorconfig`; apps vacías (`api`, `worker`, `web`, `mobile`); módulo `ordenes-servicio` con sus cuatro capas; paquetes `contracts`, `ui`, `tokens`; reglas de límites de Nx (el dominio no importa infraestructura); `docker-compose.yml` de desarrollo con PostgreSQL, Keycloak, Valkey, LiteLLM y Grafana. Ollama es opcional en el equipo local: la URL del modelo se configura con una variable (`OLLAMA_BASE_URL`) para usar un servidor Ollama compartido cuando el equipo no tenga recursos suficientes.
- Si el backend elegido no es TypeScript, adapta `apps/api` y los módulos a ese ecosistema manteniendo la misma estructura y regístralo en el ADR 002.
- **Entregable:** `pnpm install`, `pnpm build` y `pnpm test` en verde dentro del Dev Container en Windows y en macOS; una importación prohibida hace fallar el lint.

### 0.3 Capa de context engineering — 1 día

- **Ahora:** `CLAUDE.md` raíz (propósito, mapa, comandos, reglas, enlaces a `docs/`) y uno por `apps/api`, `apps/web`, `apps/mobile` y `modules/`; `.claude/settings.json` con permisos (permitir pnpm, nx y git de lectura; denegar lectura de `.env*`, `git push --force` y `kubectl` contra producción); los hooks de 5.8; los siete subagentes en `.claude/agents/` (frontmatter con nombre, descripción y herramientas); los siete comandos; skills `crear-modulo` y `crear-endpoint`.
- **Entregable:** con `/spec`, `/plan` e `/implement`, Claude crea un módulo de prueba `ping` que pasa lint, límites y pruebas sin correcciones manuales. Después se elimina.

### 0.4 Pipeline y controles de calidad — 1 día

- **Ahora:** workflow de GitHub Actions en cada PR: lint, tipos, pruebas con cobertura mínima del 80 % en dominio y aplicación, Semgrep CE, OSV-Scanner, verificación de licencias, gitleaks, Trivy sobre imágenes, SBOM CycloneDX y compatibilidad del contrato OpenAPI (oasdiff). Protección de `main`: PR obligatorio, controles en verde y una aprobación. Dependabot activo.
- **Diferido:** pruebas de extremo a extremo completas.
- **Entregable:** tres PR de prueba quedan bloqueados: uno con un secreto simulado, uno con una importación prohibida y uno con una prueba fallida.

### 0.5 Look and feel y sistema de diseño — 1 día

- **Ahora:** `docs/design/guia-estilo.md` según 5.7; tokens en `packages/tokens` convertidos con Style Dictionary a variables CSS y tema de NativeWind; temas claro y oscuro; unos 15 componentes base (botón, campo, selector, fecha, casilla, chip de estado, avatar, insignia, tabla densa, tarjeta de tablero, modal, panel lateral, aviso, barra lateral y paleta de comandos); cinco pantallas plantilla en web y móvil (inicio de sesión, panel, listado de OS con vistas lista y tablero, formulario de OS y detalle de OS); espacio para el logo de cada empresa; Storybook con revisión de accesibilidad; axe agregado al pipeline.
- **Diferido:** vistas de calendario y cronograma; diseño en Penpot.
- **Entregable:** Storybook aprobado por el revisor designado; cero violaciones graves de axe; contraste AA en ambos temas.

### 0.6 Plataforma transversal — 1,5 días

- **Ahora:** Keycloak con las empresas de prueba A y B; resolución de empresa; RLS según 5.4; roles iniciales (administrador de empresa, supervisor, técnico, consulta) detrás del puerto de autorización; auditoría append-only (quién, qué, cuándo, empresa); OpenTelemetry en api, worker y web hacia Grafana; outbox + worker; configuración por empresa (nombre, logo, idioma, modelos de IA); entidad mínima **Orden de servicio** (abonado, descripción, ubicación opcional, tipo de falla, estado, fechas) con crear, listar, ver detalle y cambiar de estado (registrada, en curso, cerrada) por API OpenAPI y clientes generados. Al cerrar una OS se publica el evento `os.cerrada` por el outbox. Módulo `integracion-erp` con `ErpPort` y un adaptador simulado que consume `os.cerrada` de forma idempotente y registra la recepción.
- **Diferido:** OpenFGA, base y despliegue dedicados, SCIM, flagd, credenciales para la API de terceros (OAuth2 client credentials en Keycloak).
- **Entregable:** la suite de aislamiento pasa (un usuario de A no puede leer, listar ni modificar OS de B, y una consulta sin empresa falla); cerrar una OS llega una sola vez al adaptador ERP simulado aunque el evento se reintente; las trazas muestran la empresa en Grafana.

### 0.7 Puerto de IA local — 0,5 días

- **Ahora:** LiteLLM frente a Ollama con dos modelos abiertos pequeños elegidos según el hardware; puerto `ClasificadorDeFallas` en `ordenes-servicio/application` y su adaptador; la clasificación se ejecuta en el worker de forma asíncrona al crearse la OS (el usuario no espera) y puede repetirse con otro modelo desde el detalle; catálogo y política por empresa; selector de modelo por usuario en web y móvil; medición de uso; prompt versionado en `prompts/`; set de evaluación con 20 descripciones de falla etiquetadas.
- **Diferido:** vLLM para mayor carga; herramientas MCP; proveedores externos.
- **Entregable:** la misma OS se clasifica con los dos modelos cambiando solo la selección del usuario; la evaluación reporta la precisión de cada modelo.

### 0.8 Infraestructura on-premise — 1 día

- **Ahora:** Kubernetes según la respuesta 3 (k3s si no existe); charts Helm propios en `infra/helm` para api, worker y web; dependencias por charts (CloudNativePG, Keycloak, Valkey, Ollama, LiteLLM, Grafana); OpenTofu para namespaces y configuración base; OpenBao para secretos; respaldo diario de PostgreSQL; runner autohospedado de GitHub Actions (solo para este repositorio privado, en un host aislado) que despliega con Helm a pruebas automáticamente y a producción con aprobación (GitHub Environments); builds móviles locales (Android en cualquier equipo; iOS en macOS) con distribución interna.
- **Diferido:** Argo CD, alta disponibilidad, almacenamiento S3.
- **Entregable:** un comando documentado recrea el ambiente de pruebas desde cero; un merge a `main` despliega a pruebas sin pasos manuales.

### 0.9 Seguridad y cumplimiento — 0,5 días

- **Ahora:** en `docs/security/`: modelo de amenazas STRIDE (inicio de sesión, OS, IA, ERP), clasificación de datos (datos personales de abonados), registro de tratamientos para la LOPDP, política de uso de IA y checklist ASVS nivel 2 con estado.
- **Diferido:** prueba de penetración externa.
- **Entregable:** documentos revisados; cada hallazgo crítico tiene una tarea asignada.

## 7. Criterio de salida de la Fase 0

El esqueleto caminante funciona en web y móvil con el look and feel aprobado:

1. Un usuario de la empresa A inicia sesión con Keycloak y ve el logo de su empresa.
2. Crea una orden de servicio y la ve en las vistas lista y tablero.
3. La IA local la clasifica por tipo de falla con el modelo que el usuario eligió.
4. Un usuario de la empresa B no puede verla.
5. La OS cerrada genera un evento que recibe el adaptador ERP simulado.
6. Todo queda trazado en Grafana y auditado.
7. Este flujo llegó al ambiente on-premise por el pipeline, sin pasos manuales.

## 8. Formato del reporte de paso

Al terminar cada paso, entrega:

- **Qué se hizo** (tres a cinco líneas).
- **Archivos** creados o cambiados.
- **Pruebas y controles** ejecutados, con resultado.
- **Decisiones** tomadas (con su ADR).
- **Diferido** agregado a la deuda planificada.
- **Riesgos o pendientes.**
- **Qué necesito de ti** para continuar.
- **Tiempo usado** frente al presupuesto del paso.
