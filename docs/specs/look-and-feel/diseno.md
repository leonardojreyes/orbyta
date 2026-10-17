<!-- Presupuesto: máximo 100 líneas. -->
# Diseño: Look and feel (paso 0.5)

**Spec:** [requisitos.md](requisitos.md) · **ADR:** 001, 004, 005, 007, 013, 014; 015 por crear (tarea 1) · **Estado:** Borrador revisado por `arquitecto`

## Alcance técnico
- Módulo nuevo `modules/marca` (crear con `/crear-modulo`, con su `CLAUDE.md`): logo y color primario por empresa.
- `packages/tokens`, `packages/ui`, `apps/web`: sistema visual, componentes, pantallas.
- `apps/api`: rutas de lectura de la marca, script de carga y registro en la composición.

## Módulo `marca`
- **Entidad:** `MarcaEmpresa` (`empresaId` inmutable, `colorPrimario` `#RRGGBB`, `logoId` opcional).
- **Dominio:** `contraste(a, b)` WCAG 2.2, `validarColorPrimario`, `validarLogo` (solo PNG por firma de bytes, máx. 256 KB; el SVG queda fuera de 0.5), puerto `RepositorioMarca`.
- **Casos de uso** (`application`, solo ven `RepositorioMarca` y `AlmacenArchivos`):
  - `ObtenerMarca(empresaId)`: la guardada o la predeterminada; si la guardada ya no cumple AA, la predeterminada.
  - `ObtenerLogo(empresaId)`: bytes del logo o `null`.
  - `GuardarMarca(empresaId, color, logo?)`: valida color y logo; guarda el logo nuevo, luego la fila; si la fila falla borra el archivo nuevo; al éxito borra el anterior. Error `ColorNoAccesibleError`.
- **Infraestructura:** `RepositorioMarcaPostgres` es el único que usa `EjecutorEmpresa` (como `_ejemplo`).
- **Entrada de `GuardarMarca`:** script de carga en `apps/api` (composición) y pruebas; sin ruta HTTP.
- **Predeterminada:** token `color.primario` en `packages/tokens`; el dominio duplica el valor.
- **Eventos:** ninguno.

## Contraste de la marca
- Texto sobre el primario (blanco u oscuro del tema) ≥ 4,5:1.
- Primario contra el fondo claro ≥ 3:1. El tema oscuro usa su propio primario aclarado (`color.oscuro.primario`), así que el color de empresa no se valida contra el fondo oscuro (decisión de la tarea 5: #1d4ed8 da 2,82:1 sobre #0f1115).
- Si no pasa, `GuardarMarca` no guarda.

## Datos y migración
- `modules/marca/infrastructure/migrations/001_marca.sql`: `marca_empresas` (`empresa_id uuid PK`, `color_primario text NOT NULL CHECK (color_primario ~ '^#[0-9A-Fa-f]{6}$')`, `logo_id uuid`).
- RLS con `FORCE`, política `aislamiento_empresa` con `USING` y `WITH CHECK`, `GRANT` a `orbyta_app`.
- El logo vive en `AlmacenArchivos`, separado por empresa; la tabla guarda su identificador.

## Contrato OpenAPI (tarea 2, antes del código)
- `GET /marca` → `{ colorPrimario, tieneLogo }`; `GET /marca/logo` → `image/png` o `404`.
- Respuestas `401`/`403` y errores en Problem Details. Empresa siempre de la identidad.
- Autorización: basta estar autenticado hasta que el guard consulte al `Autorizador` (pendiente en `docs/estado.md`).
- Se regeneran los tipos del cliente antes de implementar.
- Antes de la sesión no hay empresa: el inicio de sesión usa la marca predeterminada.

## Tokens (`packages/tokens`)
- `src/tokens.json` en formato W3C: color, tipografía, espaciado, radio, sombra.
- Style Dictionary genera `dist/tokens.css` (`:root` y `[data-tema="oscuro"]`) y tipos TS.
- Prueba de contraste de todos los pares semánticos en ambos temas.

## UI (`packages/ui`) y web (`apps/web`)
- Tailwind alimentado solo por variables de los tokens.
- Componentes (shadcn/ui): botón, campo de texto, selector, tabla, tarjeta, alerta, diálogo, navegación.
- Textos en `apps/web/src/i18n/es-EC.ts` con claves tipadas; tuteo.
- Tema: preferencia del sistema al inicio, `localStorage` después; `data-tema` en `<html>`.
- Marca: tras autenticar, `GET /marca` fija `--color-primario`; el logo va en la navegación.
- Rutas: `/catalogo`, `/ingreso`, `/listado`, `/formulario`.
- Fuente: Inter variable autoalojada, sin CDN, con licencia OFL registrada en el ADR 015.

## Pruebas y lint
- Lint: colores, tamaños y cadenas JSX literales prohibidos en `apps/web` y `packages/ui`.
- axe en cada componente y pantalla, en claro y oscuro; teclado y foco visible.
- `marca/infrastructure/aislamiento.test.ts` (PostgreSQL real): la empresa A no lee la marca de B ni un `logo_id` de B (404).
- Prueba cruzada de contraste y color predeterminado en `apps/api` (puede importar `marca` y `tokens`; el dominio no).

## Impacto multiempresa
Una fila por empresa con RLS; `GET /marca` llama a `ObtenerMarca`, cuyo repositorio fija la empresa; archivos separados por empresa.

## Datos personales
Ninguno. Logo y color son datos de la empresa; el tema queda en el navegador.

## Riesgos
- Logo malicioso: solo PNG validado por firma, tamaño limitado, `Content-Type` fijo y `nosniff`.
- Licencias: OFL-1.1 (fuente) y las de Tailwind, Style Dictionary, shadcn/Radix, TanStack Router y axe-core (MPL-2.0) se listan en el ADR 015 con versión fijada por `minimumReleaseAge`; revisar transitivas con `osv-scanner`.
- Archivo huérfano si falla el guardado: lo cubre `GuardarMarca` y su prueba.
