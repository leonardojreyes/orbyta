---
paths:
  - "modules/*/domain/**"
---
<!-- Presupuesto: máximo 40 líneas por regla. -->
# Capa de dominio
- Solo TypeScript puro: prohibido importar NestJS, ORM, clientes HTTP, SDKs o `platform/*/adapters`.
- Entidades con invariantes en el constructor; nada de setters públicos.
- Errores de negocio como clases propias del módulo, nunca excepciones HTTP.
- Toda entidad multiempresa lleva `empresaId` y no permite cambiarlo.
- Nombres según `docs/glosario.md`.
