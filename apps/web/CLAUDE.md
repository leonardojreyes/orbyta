# apps/web

Cliente web con Next.js (ADR 004). Look and feel de referencia: ClickUp; temas claro y oscuro (ADR 019).

## Reglas
- Colores, espaciados y tipografía salen de `packages/tokens`; componentes de `packages/ui`. Sin valores sueltos.
- Cada empresa solo personaliza el **logo**; el resto del diseño es común.
- Accesibilidad WCAG 2.2 AA en ambos temas; navegación por teclado. `pnpm test:a11y` (axe en navegador real) debe pasar.
- Textos desde `@orbyta/ui/textos`; nunca escritos en el componente.
- Clientes de API generados desde `packages/contracts`; no escribas llamadas HTTP a mano.
- Ningún dato personal en logs del navegador ni en URLs.

## Comandos
`pnpm nx dev web` · `pnpm nx test web` · `pnpm nx lint web` · `pnpm nx build web`
