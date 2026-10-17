# Tareas: Look and feel (paso 0.5)

Una tarea por sesión. Ninguna toca más de un módulo. Criterios: ver [requisitos.md](requisitos.md).

| # | Tarea | Toca | Prueba de aceptación | Criterios |
| --- | --- | --- | --- | --- |
| 1 | ADR 015: licencia OFL-1.1 para la fuente y lista de dependencias visuales con licencia; actualizar índice y `osv-scanner.toml` | `docs/adr`, `osv-scanner.toml` | CI `osv` en verde con la licencia añadida; el ADR enumera cada dependencia nueva | 10 |
| 2 | Contrato OpenAPI de `/marca` y `/marca/logo` (esquemas, 401/403/404, Problem Details); regenerar tipos | `packages/contracts` | El contrato valida con el linter de OpenAPI; los tipos se generan sin error | 3, 5 |
| 3 | Tokens W3C, Style Dictionary, CSS claro/oscuro, fuente autoalojada | `packages/tokens` | Prueba: todos los pares semánticos cumplen 4,5:1 (texto) y 3:1 (componentes) en ambos temas | 2, 10 |
| 4 | Lint de colores, tamaños y cadenas JSX literales en `apps/web` y `packages/ui` | raíz (ESLint) | Un archivo de prueba con `#fff` y texto literal hace fallar `pnpm lint`; el código limpio pasa | 1, 9 |
| 5 | Módulo `marca`: dominio y casos de uso con repositorio en memoria | `modules/marca` | Pruebas unitarias: contraste, `validarLogo`, `ObtenerMarca` (predeterminada), `GuardarMarca` (rechazo y limpieza del logo) | 3, 4 |
| 6 | `marca`: migración, `RepositorioMarcaPostgres` y prueba de aislamiento | `modules/marca` | `aislamiento.test.ts` contra PostgreSQL real: A no lee marca ni logo de B | 5 |
| 7 | Rutas `GET /marca` y `/marca/logo`, script de carga, composición, límites; prueba cruzada de contraste | `apps/api` | Prueba e2e con dos empresas; `pnpm limites` verde; el color predeterminado coincide con el token | 3, 4, 5 |
| 8 | Componentes base con Tailwind y shadcn | `packages/ui` | Por componente: axe sin violaciones, operable con teclado, foco visible, en claro y oscuro | 7 |
| 9 | i18n, tema claro/oscuro, aplicación de marca y página `/catalogo` | `apps/web` | Pruebas: el tema cambia sin recargar y persiste; la marca se aplica; un color no accesible usa el predeterminado | 3, 4, 6, 9 |
| 10 | Pantallas plantilla: inicio de sesión, listado con filtros, formulario | `apps/web` | axe sin violaciones en cada pantalla, en ambos temas | 8 |
| 11 | Cierre: revisión y aprobación del catálogo por el responsable | `docs/estado.md` | Aprobación registrada; `/cerrar-sesion` hecho | 11 |

## Orden
1 → 2 → 3 y 4 (independientes) → 5 → 6 → 7 → 8 → 9 → 10 → 11.
