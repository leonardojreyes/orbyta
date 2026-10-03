# ADR 023: Implementación del sistema de diseño (paso 0.5)

## Estado
Aceptado — Fase 0, paso 0.5 (2026-10-02). Concreta el [ADR 019](019-sistema-diseno.md).

## Contexto
El ADR 019 fijó la dirección (tokens W3C, Style Dictionary, Tailwind, shadcn/ui, NativeWind, Storybook). Al implementarla hubo que tomar decisiones de versiones, límites entre web y móvil y verificación de accesibilidad.

## Decisión
- **Tokens:** archivos W3C (`$value`, `$type`) en `packages/tokens/tokens/` (`base`, `claro`, `oscuro`). `pnpm tokens` los convierte con **Style Dictionary 5** en `src/generado/`: `variables.css` (claro, oscuro forzado y preferencia del sistema), `tema.ts` (valores resueltos) y un preset de Tailwind que solo conoce los colores de los tokens. Lo generado se versiona y una prueba falla si está desactualizado (`pnpm tokens:check`).
- **Tailwind 3.4** en web y móvil, con un solo preset. **NativeWind 4.2** no es compatible con Tailwind 4; se migrará cuando NativeWind 5 sea estable.
- **Temas:** en web, variables CSS y el atributo `data-theme` (con respeto a `prefers-color-scheme`). En móvil, `vars()` de NativeWind con los mismos nombres de variable.
- **Tipografía:** pila de fuentes del sistema (sin licencias que gestionar; las fuentes abiertas habituales usan SIL OFL, no permitida sin ADR).
- **Componentes web** en `packages/ui`: Tailwind + Radix (`radix-ui`), `cmdk` para la paleta y la búsqueda del selector, iconos `lucide-react`. No se instala el CLI de shadcn: se escriben los componentes con las mismas bases (Radix, `class-variance-authority`, `tailwind-merge`).
- **Componentes móviles** en `apps/mobile/src/componentes` (React Native + NativeWind). No se comparten con web: comparten tokens, textos (`@orbyta/ui/textos`) y datos de ejemplo (`@orbyta/ui/ejemplos`).
- **Textos** externalizados en `packages/ui/src/i18n/es-EC.ts`; ninguna pantalla escribe textos a mano.
- **Accesibilidad:**
  1. `jest-axe` en las pruebas de componentes y pantallas (estructura, nombres, roles).
  2. **Contraste calculado** sobre los tokens (`packages/tokens`, 56+ pruebas), que falla el build.
  3. **Playwright + axe-core** en navegador real, sobre las 5 pantallas web (con sus estados) y **todas las historias de Storybook**, en tema claro y oscuro. Job `accesibilidad` del CI. Sin transiciones durante la medición para no evaluar colores a mitad de una animación.
- **Storybook 10** (`pnpm storybook`, `pnpm build:storybook`) con el complemento de accesibilidad en modo `error`.
- **Marca:** el logo de Orbyta (`docs/design/marca/orbyta-logo.svg`) es fijo; el logo de empresa es un componente con espacio de 160 × 40 px que cae al nombre si no hay imagen. En móvil se usa una versión PNG rasterizada del SVG (Image no renderiza SVG).

## Alternativas consideradas
- **Tailwind 4 solo en web:** dos configuraciones y dos presets; se pierde la ventaja de un único preset.
- **CLI de shadcn/ui:** copia componentes con estilos propios del generador; se prefiere escribirlos sobre los tokens para no tener valores sueltos.
- **Storybook test-runner:** más pesado; Playwright + axe sobre `index.json` cubre lo mismo con un solo mecanismo para web y Storybook.
- **Estilos de React Native con `StyleSheet` y un objeto de tema:** más simple, pero abandona la unificación de clases con la web prevista en el ADR 019.

## Consecuencias
- Cambiar un color es editar un JSON y ejecutar `pnpm tokens`; web y móvil lo reciben juntos.
- Las pruebas de móvil validan comportamiento y accesibilidad (roles, nombres); **no se probó en dispositivo ni simulador**: se exportó como web (`expo export --platform web`) y se revisó en Chrome. Pendiente de la revisión humana en iOS y Android.
- `jest-expo` no resuelve las rutas de `tsconfig.base.json`; `apps/mobile/jest.config.cts` las mapea a mano (`@orbyta/ui/textos`, `@orbyta/ui/ejemplos`, `@orbyta/tokens`).
- La versión oscura del logo de Orbyta está pendiente; en tema oscuro el logo conserva su fondo claro.
- Los componentes web y móvil quedan duplicados en comportamiento; se mantienen alineados por la guía de estilo y los tokens.

## Licencia
Tailwind CSS 3.4, PostCSS, Radix, `cmdk`, `clsx`, `tailwind-merge`, NativeWind, `react-native-reanimated`, Storybook, `jest-axe`, `@expo/vector-icons`: MIT. Style Dictionary, `class-variance-authority`, Playwright: Apache-2.0. `lucide-react`: ISC. `axe-core` y `@axe-core/playwright`: MPL-2.0. Todas dentro de las licencias permitidas (ADR 022).
