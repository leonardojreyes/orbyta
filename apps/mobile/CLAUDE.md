# apps/mobile

App móvil con Expo / React Native (ADR 005). Los técnicos trabajan **sin señal**: modo offline obligatorio (ADR 021).

## Reglas
- Lectura y captura de OS funcionan sin conexión; sincronización posterior con resolución de conflictos definida en el ADR 021.
- Mismos tokens y componentes que web (`packages/tokens`, NativeWind); temas claro y oscuro.
- Almacenamiento local con datos mínimos y cifrado donde aplique (MASVS).
- Clientes de API generados desde `packages/contracts`.
- Builds de iOS solo en macOS; Android en cualquier equipo.

## Comandos
`pnpm nx start mobile` · `pnpm nx test mobile` · `pnpm nx lint mobile`
