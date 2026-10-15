---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---
# Pruebas
- TDD: la prueba se escribe antes y se ve fallar.
- Unitarias del dominio sin base de datos; integración contra PostgreSQL real local, nunca simulado.
- Nombres en español que describan el comportamiento: `rechaza la orden sin cliente`.
- Datos de prueba con dos empresas siempre que el código toque datos de negocio.
- Vitest con máximo 2 workers; ejecuta solo el paquete afectado.
