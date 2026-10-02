# ADR 019: Sistema de diseño — tokens W3C + Style Dictionary; Tailwind + shadcn/ui; NativeWind; Storybook

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
Orbyta necesita un look and feel propio (paleta y tipografía de Orbyta, no de ClickUp), consistente entre web y móvil, con modo claro y oscuro (confirmado en la ronda de preguntas) y marca por empresa limitada al logo.

## Decisión
**Tokens de diseño en formato W3C**, transformados con **Style Dictionary** a variables CSS (web) y tema de **NativeWind** (móvil). **Tailwind + shadcn/ui** para los componentes base en web; **NativeWind** para aplicar los mismos tokens en React Native. **Storybook** documenta y revisa accesibilidad de los componentes.

## Alternativas consideradas
- **Librería de componentes de terceros con su propio tema (p. ej. Material UI, Ant Design):** más rápido al inicio, pero impone su propio lenguaje visual, dificultando lograr un look and feel propio inspirado solo en los *patrones* de ClickUp (sección 5.7) sin copiar su marca.
- **CSS-in-JS sin tokens centralizados:** flexible, pero no garantiza que "ningún valor visual se escriba a mano en una pantalla" (sección 5.7), ni facilita verificar contraste WCAG de forma sistemática.

## Consecuencias
- Ningún color/espaciado se escribe a mano en una pantalla; todo sale de `packages/tokens`.
- Los ~15 componentes base y las 5 pantallas plantilla del paso 0.5 se construyen sobre esta base.
- axe se integra al pipeline para verificar accesibilidad de forma continua (paso 0.4/0.5).

## Licencia
Style Dictionary: Apache 2.0. Tailwind CSS: MIT. shadcn/ui: MIT. NativeWind: MIT. Storybook: MIT.
