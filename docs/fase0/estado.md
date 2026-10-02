# Estado — Fase 0 Orbyta

> Leer este archivo antes que nada al iniciar cualquier sesión (regla 3.2).

## Paso actual

**0.1 — Decisiones fundacionales.** Aprobado (2026-10-01). Siguiente: **0.2 — Repositorio y esqueleto**, listo para entrar en modo plan (repositorio y `gh` ya resueltos).

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

## Próximo paso

**0.2 — Repositorio y esqueleto.** Listo para iniciar (entrar en modo plan, presentar plan, esperar "adelante").

## Historial

- 2026-10-01 — Paso 0.1 ejecutado: comando `/fase0-inicio` creado y corrido, 21 ADRs redactados, `base-tecnica.md`, `glosario.md`, `deuda-planificada.md` y `docs/architecture/modulos.md` creados.
- 2026-10-01 — Paso 0.1 **aprobado** por el usuario.
- 2026-10-01 — Repositorio GitHub `leonardojreyes/orbyta` confirmado vacío y privado; `gh` autenticado (usar `env -u GITHUB_TOKEN gh ...` por el alcance limitado del token de la variable de entorno).
- 2026-10-01 — `leonardojreyes` confirmado como revisor humano de PRs y ADRs. Paso 0.1 queda sin pendientes bloqueantes para iniciar el 0.2.
