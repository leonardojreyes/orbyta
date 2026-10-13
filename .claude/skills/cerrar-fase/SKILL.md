---
description: Cierra una fase, registra aprendizajes y deja el contexto ordenado para la siguiente.
disable-model-invocation: true
---
Cierra la fase actual:

1. Verifica el criterio de salida del documento de la fase; si algo falta, repórtalo y detente.
2. Completa la sección "Aprendizajes" (máximo 10 líneas) y marca la fase como "Cerrada" en el índice.
3. Revisa el contexto: `CLAUDE.md`, `.claude/rules/`, los `CLAUDE.md` de módulos y las skills. Propón eliminar lo obsoleto, fusionar lo repetido y mover lo que esté en el lugar equivocado. Sugiere al usuario ejecutar `/doctor prompt-audit`.
4. Ejecuta `pnpm contexto` y corrige lo que supere el presupuesto.
5. Deja `docs/estado.md` limpio, apuntando a `/nueva-fase`.
