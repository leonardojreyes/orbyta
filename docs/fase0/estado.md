# Estado — Fase 0 Orbyta

> Leer este archivo antes que nada al iniciar cualquier sesión (regla 3.2).

## Paso actual

**0.4 — Pipeline y controles de calidad.** En planificación (rama `fase0/0.4`); plan pendiente de "adelante". Los pasos 0.2 y 0.3 están aprobados y mergeados (PR [#1](https://github.com/leonardojreyes/orbyta/pull/1) y [#2](https://github.com/leonardojreyes/orbyta/pull/2)).

## Decisiones tomadas en el paso 0.1

Registradas también como ADR cuando aplica.

| Decisión | Respuesta | ADR |
| --- | --- | --- |
| Backend | TypeScript + NestJS | [002](../adr/002-backend.md) |
| Tema visual | Claro y oscuro (ambos) | [019](../adr/019-sistema-diseno.md) |
| Keycloak: organización vs. realm por empresa | Realm por empresa | [007](../adr/007-identidad.md) |
| Móvil sin conexión | Sí, los técnicos trabajan sin señal; necesario modo offline | [021](../adr/021-movil-sin-conexion.md) |
| Kubernetes existente | No existe; se instala k3s | [011](../adr/011-ejecucion.md) |
| Ambientes separados pruebas/producción | No, por ahora solo un ambiente | [011](../adr/011-ejecucion.md) (riesgo, ver abajo) |
| GPU para Ollama | No se sabe todavía; se asume solo CPU | [014](../adr/014-ia.md) |
| Módulos candidatos | Confirmados + se agrega **contratos** | `docs/architecture/modulos.md` |
| Glosario inicial | Confirmado + se agrega **Contrato** | `docs/fase0/glosario.md` |
| ERP | Palmera (desarrollo interno de la empresa) | [020](../adr/020-integracion-erp.md) |
| Mecanismo de integración ERP | Tablas/vistas de base de datos | [020](../adr/020-integracion-erp.md) |
| Servidores disponibles | Por ahora solo la computadora de desarrollo actual | [011](../adr/011-ejecucion.md) (riesgo, ver abajo) |
| Revisores humanos | **leonardojreyes** (único revisor humano de PRs y ADRs en esta Fase 0) | resuelto |
| Repositorio GitHub | `https://github.com/leonardojreyes/orbyta` (privado, vacío). `gh` autenticado como `leonardojreyes`; el token de la variable `GITHUB_TOKEN` tiene alcance limitado, usar el de keyring (`env -u GITHUB_TOKEN gh ...`) para operaciones de repo | resuelto |

## Pendientes / riesgos abiertos

1. **Infraestructura on-premise real.** Hoy solo hay una computadora de desarrollo; no hay servidores dedicados ni separación pruebas/producción. k3s puede correr en un solo nodo mientras tanto. **Debe resolverse antes de cerrar el paso 0.8.**
2. ~~Revisores humanos no nombrados~~ — **resuelto**: `leonardojreyes` es el único revisor humano de PRs y ADRs. Nota: con un solo revisor que es además quien implementa, la protección de `main` del paso 0.4 (una aprobación obligatoria) la cumple la misma persona — se deja como riesgo de "autoaprobación" documentado, no como bloqueante.
3. ~~URL del repositorio GitHub no definida~~ — **resuelto**: `https://github.com/leonardojreyes/orbyta` (privado, vacío), `gh` autenticado.
4. **Disponibilidad de GPU no confirmada** para Ollama. Se eligieron modelos pequeños aptos para CPU como escenario conservador; reconfirmar en el paso 0.7/0.8.
5. **Mecanismo exacto de integración con Palmera** (qué vistas, periodicidad, mecanismo de escritura) no está definido más allá de "tablas/vistas de base de datos"; se debe acordar con el equipo de Palmera antes de Fase 1.
6. **Identidad de git autoconfigurada.** El primer commit se hizo con `leo@Leonardos-MacBook-Pro-5.local` (autodetectado), no con el correo real del usuario. No bloqueante; corregible con `git config --global user.email/user.name` si se quiere otra identidad de autor en los commits.
7. **Devcontainer y docker-compose sin probar de punta a punta.** Este entorno no tiene motor de contenedores (Docker/Podman/Rancher Desktop) instalado, así que no se pudo levantar `.devcontainer/` ni `docker-compose.yml` para verificarlos. **Pendiente de que el revisor humano los pruebe en un equipo con Rancher Desktop o Podman Desktop** antes de cerrar el paso 0.2 como verificado end-to-end.

8. **Hooks `PreToolUse` solo cubren Edit/Write/Bash.** El subagente `ingeniero-pruebas` y `documentador` tienen "escritura solo en pruebas / solo en `docs/`" como instrucción en su prompt, no como barrera técnica. Endurecer (hook por agente) si se observan desvíos.
9. **Escaneo de secretos del hook `Stop`** usa gitleaks si está instalado; si no, un conjunto básico de patrones. gitleaks real entra en el pipeline en 0.4.
10. **Nombres de proyecto Nx de `ordenes-servicio`** son `domain`, `application`, etc. (sin prefijo del módulo); los módulos nuevos usan `<modulo>-<capa>`. Renombrar antes de agregar un segundo módulo real para evitar choques.

## Próximo paso

**0.5 — Look and feel y sistema de diseño.** Después de aprobar el 0.4.

## Historial

- 2026-10-01 — Paso 0.1 ejecutado: comando `/fase0-inicio` creado y corrido, 21 ADRs redactados, `base-tecnica.md`, `glosario.md`, `deuda-planificada.md` y `docs/architecture/modulos.md` creados.
- 2026-10-01 — Paso 0.1 **aprobado** por el usuario.
- 2026-10-01 — Repositorio GitHub `leonardojreyes/orbyta` confirmado vacío y privado; `gh` autenticado (usar `env -u GITHUB_TOKEN gh ...` por el alcance limitado del token de la variable de entorno).
- 2026-10-01 — `leonardojreyes` confirmado como revisor humano de PRs y ADRs. Paso 0.1 queda sin pendientes bloqueantes para iniciar el 0.2.
- 2026-10-01 — Paso 0.2 ejecutado: commit inicial en `main` con los documentos del paso 0.1; monorepo Nx + pnpm (apps api/web/worker/mobile, módulo `ordenes-servicio` con sus 4 capas, paquetes contracts/ui/tokens, devcontainer, docker-compose de desarrollo) en la rama `fase0/0.2`; `pnpm install/build/test/lint` en verde (11/11 proyectos); PR [#1](https://github.com/leonardojreyes/orbyta/pull/1) abierto. Pendiente de aprobación y merge.
- 2026-10-01 — Paso 0.2 **aprobado** y PR #1 mergeado a `main` (`a04ecaf`) por el revisor. Pendiente 7 (devcontainer/compose sin probar) sigue abierto. Se crea la rama `fase0/0.3`.
- 2026-10-01 — Paso 0.3 ejecutado en la rama `fase0/0.3`: `CLAUDE.md` raíz (72 líneas) y por `apps/api`, `apps/web`, `apps/mobile` y `modules/`; `.claude/settings.json` (permisos y hooks); 4 hooks Node con pruebas (`pnpm test:hooks`); 7 subagentes; comandos `spec`, `plan`, `tasks`, `implement`, `review`, `adr`; skills `crear-modulo` y `crear-endpoint`; `prettier` como devDependency (MIT). Entregable verificado con el módulo `ping` creado vía `/spec`→`/plan`→`/tasks`→`/implement` (T1–T6), con lint, límites y pruebas en verde, y eliminado en un commit posterior. Correcciones durante la prueba: la skill `crear-modulo` declaraba dependencias entre capas antes de usarlas (el lint `@nx/dependency-checks` falla); se corrigió. Pendiente de aprobación y merge.
- 2026-10-01 — Paso 0.3 **aprobado** y PR #2 mergeado a `main` (`57c5595`). Verificado: `pnpm lint` y `pnpm test` 11/11, `pnpm test:hooks` 5/5. Se crea la rama `fase0/0.4`.
