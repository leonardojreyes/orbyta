<!-- Guía para el equipo. Claude la lee solo cuando va a agregar reglas, skills o documentación. -->
# Guía del contexto de Claude Code

## Idea central

Claude solo debe tener en la cabeza lo que necesita para la tarea del momento. Por eso el contexto está en capas: una base pequeña que se carga siempre y el resto, que se carga solo cuando Claude toca un archivo o invoca un procedimiento.

| Capa | Archivo | Cuándo se carga | Presupuesto |
| --- | --- | --- | --- |
| 1. Base | `CLAUDE.md` + `docs/estado.md` (importado) | Siempre, en cada sesión | 80 + 40 líneas |
| 2. Reglas por ruta | `.claude/rules/*.md` con `paths:` | Cuando Claude lee o edita un archivo que coincide | 40 líneas cada una |
| 3. Contexto de módulo | `modules/<m>/CLAUDE.md` | Cuando Claude trabaja en ese módulo | 30 líneas |
| 4. Procedimientos | `.claude/skills/<nombre>/SKILL.md` | Solo al invocarlos; los manuales no cuestan nada hasta entonces | 60 líneas + archivos de apoyo |
| 5. Revisores | `.claude/agents/*.md` | En su propio contexto, sin llenar el de la sesión principal | 40 líneas |
| 6. Conocimiento | `docs/` con índices | Cuando Claude lo lee, guiado por los índices | Indicado en cada archivo |
| 7. Obligatorio | Hooks en `.claude/settings.json` | Se ejecutan siempre; no ocupan contexto | — |

Total que se carga en cada sesión: **menos de 2.500 tokens**. `pnpm contexto` lo mide y el CI falla si se supera cualquier presupuesto.

## Dónde va cada cosa

Antes de agregar una instrucción, recorre esta lista en orden y usa el primer lugar que aplique:

1. **¿Tiene que cumplirse sin excepción?** → Hook o control del CI, no texto. Un texto se puede ignorar; un hook no.
2. **¿Es una decisión con su porqué?** → ADR en `docs/adr/` + una línea en su índice. `CLAUDE.md` nunca explica el porqué.
3. **¿Es un procedimiento de varios pasos?** → Skill. Si lo invoca una persona, con `disable-model-invocation: true`.
4. **¿Aplica solo a un tipo de archivo o carpeta?** → Regla en `.claude/rules/` con `paths:`.
5. **¿Aplica solo a un módulo?** → `modules/<m>/CLAUDE.md`.
6. **¿Es el requisito de una funcionalidad?** → `docs/specs/<funcionalidad>/`.
7. **¿Describe dónde va el trabajo hoy?** → `docs/estado.md`. Lo cerrado se mueve al documento de la fase.
8. **¿Es material de consulta largo?** → `docs/` o un archivo de apoyo dentro de una skill, enlazado desde un índice.
9. **¿Aplica siempre, en todo el repositorio, y cabe en una línea?** → Recién entonces, `CLAUDE.md`.

## Reglas de escritura

- Frases cortas e imperativas. Una instrucción por línea.
- No repitas: si algo ya está en otro archivo, enlázalo con su ruta entre comillas invertidas.
- Las notas para humanos van en comentarios HTML (`<!-- ... -->`): Claude Code los quita antes de cargar el archivo, así que no consumen tokens.
- Ojo con `@ruta` en `CLAUDE.md`: importa el archivo completo en cada sesión. Úsalo solo para `estado.md`. Para todo lo demás, menciona la ruta entre comillas invertidas y Claude la leerá cuando la necesite.
- Si dos instrucciones se contradicen, Claude puede elegir cualquiera. Al agregar una regla, busca y elimina la que reemplaza.

## Cómo crece con el producto

| Momento | Qué se agrega |
| --- | --- |
| Fase 0 | Este kit completo, ajustado al stack elegido |
| Cada funcionalidad nueva | Su carpeta en `docs/specs/` y, si crea un módulo, su `CLAUDE.md` (con `/crear-modulo`) |
| Cada decisión de arquitectura | Un ADR y una línea en el índice (con `/adr`) |
| Una corrección que se repite dos veces | Una línea en la regla o el `CLAUDE.md` de módulo que corresponda |
| Un procedimiento que se repite tres veces | Una skill nueva |
| Una nueva tecnología (móvil, IA, Kubernetes) | Una regla con `paths:` para sus carpetas; nunca líneas nuevas en `CLAUDE.md` raíz |
| Fin de cada fase | `/cerrar-fase`: limpiar, fusionar y mover; ejecutar `/doctor prompt-audit` |

## Mantenimiento

- `pnpm contexto` en cada PR (en el CI) y al final de cada sesión (`/cerrar-sesion`).
- `/doctor prompt-audit` al cerrar cada fase, para encontrar instrucciones repetidas, obsoletas o contradictorias.
- Si Claude ignora una regla: primero verifica que se cargó (el `paths:` coincide con el archivo); luego, que no la contradiga otra; por último, si es crítica, conviértela en hook.
