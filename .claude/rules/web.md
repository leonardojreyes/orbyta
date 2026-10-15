---
paths:
  - "apps/web/**"
  - "packages/ui/**"
  - "packages/tokens/**"
---
# Web y sistema de diseño
- Ningún color, tamaño o espaciado escrito a mano: todo sale de `packages/tokens`.
- Usa componentes de `packages/ui` antes de crear uno nuevo; si creas uno, va en `packages/ui`.
- Textos en archivos de traducción (español de Ecuador por defecto), nunca literales en componentes.
- Llamadas a la API solo con el cliente generado de `packages/contracts`.
- Accesibilidad WCAG 2.2 AA: etiquetas en formularios, foco visible, contraste verificado.
