---
paths:
  - "**/migrations/**"
  - "modules/*/infrastructure/**"
  - "platform/tenancy/**"
---
# Datos y multiempresa
- Toda tabla de negocio tiene `empresa_id NOT NULL` y una política RLS que filtra por `current_setting('app.empresa_id')`.
- Cada transacción ejecuta `SET LOCAL app.empresa_id`; sin empresa, la consulta debe fallar.
- La app se conecta con un rol sin `BYPASSRLS`. Las migraciones usan otro rol.
- Migraciones solo hacia adelante; nunca edites una migración ya aplicada (crea una nueva).
- Todo repositorio nuevo trae una prueba que intenta leer datos de otra empresa y debe fallar, contra PostgreSQL real.
