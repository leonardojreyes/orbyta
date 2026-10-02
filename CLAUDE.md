# Orbyta

Plataforma multiempresa para gestionar **proyectos** y **órdenes de servicio (OS)** en empresas de servicios del Ecuador (ej. red de agua potable y reclamos de abonados). Canales: web, móvil (iOS/Android) y API para terceros. IA local con Ollama; despliegue on-premise. Desarrolla SynapTech.

**Estado de trabajo:** estamos en la **Fase 0** (`FASE0-Orbyta.md`). Al iniciar cualquier sesión lee `docs/fase0/estado.md` antes que nada.

## Mapa del repositorio

```
apps/api         NestJS (API REST/OpenAPI)           → apps/api/CLAUDE.md
apps/worker      Procesos asíncronos (outbox, IA)
apps/web         Next.js                             → apps/web/CLAUDE.md
apps/mobile      Expo / React Native, modo offline   → apps/mobile/CLAUDE.md
modules/<mod>/   domain · application · infrastructure · interface   → modules/CLAUDE.md
packages/        contracts (OpenAPI/DTO), ui, tokens (diseño)
platform/        tenancy, auth, ia-gateway, observabilidad (aún no creado; paso 0.6)
prompts/         prompts de IA versionados (paso 0.7)
infra/           helm, tofu (paso 0.8)
docs/            fase0, adr, architecture, specs, security, design
.claude/         settings, hooks, agents, commands, skills
```

## Comandos (siempre scripts Node/pnpm, nunca bash)

| Qué                         | Comando                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| Instalar                    | `pnpm install`                                                        |
| Build / test / lint de todo | `pnpm build` · `pnpm test` · `pnpm lint`                              |
| Un proyecto                 | `pnpm nx test <proyecto>` · `pnpm nx lint <proyecto>`                 |
| Solo lo afectado            | `pnpm nx affected -t lint test`                                       |
| Grafo de dependencias       | `pnpm nx graph`                                                       |
| Pruebas de los hooks        | `pnpm test:hooks`                                                     |
| Servicios de desarrollo     | `docker compose up -d` (Postgres, Keycloak, Valkey, LiteLLM, Grafana) |

## Flujo por funcionalidad

`/spec` → `/plan` → `/tasks` → `/implement` (una tarea por sesión, pruebas primero) → `/review` (subagentes en paralelo) → PR con controles en verde y aprobación humana. Decisiones: `/adr`. Skills: `crear-modulo`, `crear-endpoint`. Specs en `docs/specs/<nombre>/`.

Subagentes (`.claude/agents/`): arquitecto, revisor-multiempresa, revisor-seguridad, ingeniero-pruebas, auditor-accesibilidad, revisor-cumplimiento, documentador.

## Reglas

1. **Un paso de la Fase 0 a la vez.** Presenta el plan y espera "adelante"; al terminar entrega el reporte (sección 8 de `FASE0-Orbyta.md`) y espera "aprobado".
2. **Ramas y PR:** trabaja en `fase0/<paso>`; nunca commits directos a `main`. Revisor humano: `leonardojreyes`.
3. **Commits** en inglés con Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).4. **Si falta información, pregunta; no supongas.**
4. **Nunca:** secretos en el código, leer o editar `.env*`, comandos destructivos o contra producción sin aprobación, dependencias con licencia no permitida sin ADR de excepción.
5. **Licencias:** MIT, Apache 2.0, BSD o MPL. AGPL solo como servicio aparte sin modificar. BSL/SSPL/source-available requieren ADR. Verifica antes de agregar una dependencia.
6. **Windows y macOS:** scripts en Node, rutas con `path`, finales de línea LF (`.gitattributes`).
7. **Cada decisión relevante es un ADR** en `docs/adr/NNN-titulo.md` (contexto, decisión, alternativas, consecuencias, licencia).
8. Mantén este archivo en **máximo 150 líneas**; el detalle va a `docs/`.
9. `gh` con repos: usa `env -u GITHUB_TOKEN gh ...` (el token de la variable tiene alcance limitado).

## Arquitectura (resumen; detalle en `docs/adr/` y `docs/architecture/`)

- Monolito modular + hexagonal (ADR 001). `domain` no conoce frameworks, base de datos, ERP ni IA.
- `application` define puertos; `infrastructure` los implementa; `interface` depende de `application`, nunca de `infrastructure`. Nx lo hace cumplir con etiquetas `scope:` y `type:`; una importación prohibida falla el lint.
- Los módulos se comunican por contratos o eventos (outbox), nunca por internals.
- **Multiempresa:** toda lectura y escritura se acota a la empresa del contexto autenticado (realm Keycloak por empresa + RLS). Sin empresa, la consulta falla. Cada empresa solo cambia el logo.
- Datos personales de abonados: LOPDP; fuera de logs, trazas y prompts.

## Documentos clave

- `FASE0-Orbyta.md` — especificación de la Fase 0 (rol, reglas, pasos, criterio de salida).
- `docs/fase0/estado.md` — paso actual, decisiones y pendientes.
- `docs/fase0/base-tecnica.md`, `glosario.md`, `deuda-planificada.md`.
- `docs/architecture/modulos.md` — mapa de módulos y dependencias permitidas.
- `docs/adr/` — decisiones 001–021.

## Lenguaje ubicuo

Usa el glosario (`docs/fase0/glosario.md`): Proyecto, Tarea, Hito, Orden de servicio (OS), Abonado, Punto de servicio, Técnico, Cuadrilla, Tipo de falla, Estado de la OS, SLA, Contrato. Código y documentación en español de dominio; identificadores técnicos en inglés solo si el framework lo exige.
