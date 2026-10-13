---
description: Actualiza el estado del proyecto al final de una sesión de trabajo.
disable-model-invocation: true
---
Cierra la sesión:

1. Reescribe `docs/estado.md` (máximo 40 líneas): en curso, próximo paso concreto, pendientes y bloqueos, las tres decisiones más recientes y los recursos medidos con `pnpm recursos`.
2. Elimina de `estado.md` lo que ya no sea presente; si es historia relevante, muévelo a la sección del documento de la fase.
3. Si en la sesión el usuario corrigió algo que deba valer siempre, propón dónde guardarlo según `docs/guia-contexto.md` ("Dónde va cada cosa"). No lo agregues sin aprobación.
4. Ejecuta `pnpm contexto` y reporta si algún archivo supera su presupuesto.
