# Guía de estilo de Orbyta

> **Estado:** borrador para aprobación del revisor (`leonardojreyes`). Paso 0.5 de la Fase 0. Decisiones técnicas en [ADR 019](../adr/019-sistema-diseno.md).
> Todo valor de esta guía vive en `packages/tokens`. **Ninguna pantalla escribe un color, espaciado o tamaño a mano.**

## 1. Principios

1. **Densidad útil.** Los usuarios de oficina manejan muchas órdenes de servicio (OS) a la vez: más información por pantalla, sin saturar.
2. **Acción rápida.** Lo frecuente está a uno o dos toques o atajos: crear OS, cambiar estado, buscar.
3. **El estado se entiende de un vistazo**, con color **y** texto o icono. Nunca solo color.
4. **Móvil pensado para el técnico de campo:** una mano, guantes, poca señal, sol directo.
5. **Accesible por defecto:** WCAG 2.2 AA en ambos temas, teclado completo.
6. **Sobrio y propio.** Se toman los _patrones de interacción_ de herramientas como ClickUp, nunca su marca: sin logos, iconos, ilustraciones ni colores de ClickUp.

## 2. Patrones de interacción

| Patrón             | Regla                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Barra lateral      | Jerarquía **empresa → proyectos → vistas**. Colapsable. Muestra el logo de la empresa arriba.         |
| Barra superior     | Búsqueda global, botón de acción principal ("Nueva OS") y menú de usuario.                            |
| Paleta de comandos | `Ctrl+K` / `Cmd+K`. Busca OS, proyectos y acciones. Navegable solo con teclado.                       |
| Varias vistas      | Los mismos datos como **lista** y **tablero** en la Fase 0. Calendario y cronograma quedan diferidos. |
| Panel lateral      | El detalle de una OS se abre a la derecha sin perder la lista. Cierra con `Esc`.                      |
| Chips de estado    | Color + texto (sección 6). Siempre el mismo componente.                                               |
| Acciones rápidas   | Cambiar estado y asignar desde la fila o la tarjeta, sin abrir el detalle.                            |

## 3. Color

### 3.1 Paleta base (marca)

| Rol                         | Valor     | Uso                                                 |
| --------------------------- | --------- | --------------------------------------------------- |
| Primario                    | `#004B72` | Botones, encabezados, enlaces                       |
| Primario hover / secundario | `#0A7A86` | Estado hover y acciones secundarias                 |
| Acento                      | `#00C9A7` | Iconos grandes, gráficos, indicadores, halo de foco |
| Éxito (texto)               | `#1A7F45` | Texto e iconos de completado                        |
| Éxito (relleno)             | `#2ECC71` | Fondos, badges, barras de progreso                  |
| Advertencia                 | `#B7791F` | Solo iconos grandes y rellenos decorativos          |
| Error                       | `#C53030` | Errores, vencido                                    |
| Texto principal             | `#1B2A36` |                                                     |
| Texto secundario            | `#5B6873` |                                                     |
| Borde fuerte                | `#A2ADB5` | Separadores marcados (no bordes de campos, ver 3.3) |
| Borde suave                 | `#DDE2E6` | Separadores decorativos                             |
| Fondo de la app             | `#F5F4F0` |                                                     |
| Superficie                  | `#FFFFFF` | Tarjetas, modales                                   |

**Proporción:** unos **60 % neutros**, **30 % azul marino** (navegación, botones, enlaces) y **10 % teal o verde** como acento. El teal y el verde destacan porque son pocos.

### 3.2 Tema claro

| Token                       | Valor     | Contraste                             |
| --------------------------- | --------- | ------------------------------------- |
| `color.fondo`               | `#F5F4F0` | —                                     |
| `color.superficie`          | `#FFFFFF` | —                                     |
| `color.texto`               | `#1B2A36` | 13,3 sobre fondo                      |
| `color.texto-secundario`    | `#5B6873` | 5,2 sobre fondo, 5,7 sobre superficie |
| `color.primario`            | `#004B72` | 8,5 como enlace; 9,3 con texto blanco |
| `color.primario-hover`      | `#0A7A86` | 5,1 con texto blanco                  |
| `color.acento`              | `#00C9A7` | solo decorativo (1,9 sobre fondo)     |
| `color.exito-texto`         | `#1A7F45` | 5,0 sobre blanco; 4,6 sobre fondo     |
| `color.exito-relleno`       | `#2ECC71` | texto encima: `#1B2A36` (7,0)         |
| `color.advertencia-texto`   | `#8F5F12` | 5,5 sobre blanco; 5,0 sobre fondo     |
| `color.advertencia-relleno` | `#E0A93B` | texto encima: `#1B2A36` (6,9)         |
| `color.error`               | `#C53030` | 5,5 sobre blanco; 5,0 sobre fondo     |
| `color.borde-campo`         | `#7C8993` | 3,3 sobre fondo; 3,6 sobre blanco     |
| `color.borde-suave`         | `#DDE2E6` | decorativo                            |
| `color.foco`                | `#004B72` | anillo de 2 px con halo `#00C9A7`     |

### 3.3 Tema oscuro

| Token                    | Valor     | Contraste                                                           |
| ------------------------ | --------- | ------------------------------------------------------------------- |
| `color.fondo`            | `#0B1E2B` | —                                                                   |
| `color.superficie`       | `#12293A` | —                                                                   |
| `color.texto`            | `#E8EEF2` | 14,5 sobre fondo                                                    |
| `color.texto-secundario` | `#A9B7C2` | 8,3 sobre fondo; 7,3 sobre superficie                               |
| `color.primario`         | `#4A9FCF` | 5,8 sobre fondo; 5,1 sobre superficie; texto encima `#0B1E2B` (5,8) |
| `color.primario-base`    | `#2F86B3` | solo rellenos y gráficos (4,2 sobre fondo)                          |
| `color.acento`           | `#00C9A7` | 8,0 sobre fondo; 7,1 sobre superficie                               |
| `color.exito`            | `#4ADE80` | 9,8 sobre fondo                                                     |
| `color.advertencia`      | `#E6B04A` | 8,6 sobre fondo                                                     |
| `color.error`            | `#F27A7A` | 6,4 sobre fondo                                                     |
| `color.borde-campo`      | `#5F7789` | 3,6 sobre fondo; 3,2 sobre superficie                               |
| `color.borde-suave`      | `#2A4256` | decorativo                                                          |
| `color.foco`             | `#00C9A7` | 8,0 sobre fondo                                                     |

### 3.4 Reglas de uso

- **Ajustes frente a los colores iniciales.** Algunos valores de marca no alcanzan AA en ciertos usos y se derivaron variantes: advertencia (texto `#8F5F12`, relleno `#E0A93B`), borde de campo (`#7C8993`), foco claro (`#004B72`), primario oscuro (`#4A9FCF`) y texto oscuro sobre verde. Los valores originales siguen disponibles como tokens decorativos.
- **El teal no es texto ni foco en el tema claro** (contraste 1,9). Úsalo con etiqueta o valor visible al lado.
- **Gráficos e indicadores:** el color nunca va solo; siempre con etiqueta, valor o patrón.
- **Texto sobre `#2ECC71`:** siempre `#1B2A36`, nunca blanco (2,1).
- **Texto deshabilitado** está exento de contraste en WCAG, pero debe seguir legible y acompañado del estado `disabled` accesible.
- El contraste de **todos** estos pares se verifica con un script en el build; si un par baja del mínimo, el build falla.

## 4. Tipografía

- **Pila del sistema**, sin fuentes descargadas ni licencias que gestionar:
  `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Cifras tabulares en tablas (`font-variant-numeric: tabular-nums`).
- Monoespaciada solo para identificadores técnicos: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.

| Token       | Tamaño / interlineado | Uso                                   |
| ----------- | --------------------- | ------------------------------------- |
| `texto.xs`  | 12 / 16               | Chips, metadatos                      |
| `texto.sm`  | 13 / 20               | **Base en tablas densas**             |
| `texto.md`  | 14 / 20               | Base de la web                        |
| `texto.lg`  | 16 / 24               | **Base en móvil**; títulos de tarjeta |
| `texto.xl`  | 20 / 28               | Títulos de sección                    |
| `texto.2xl` | 24 / 32               | Título de página                      |

Grosores: 400 (texto), 500 (etiquetas y botones), 600 (títulos). El texto del usuario puede crecer hasta el 200 % sin perder contenido.

## 5. Espaciado, forma y elevación

- **Espaciado** en base 4 px: 4, 8, 12, 16, 24, 32, 48 (`espacio.1` … `espacio.7`).
- **Radios:** `radio.sm` 4 px (campos, chips), `radio.md` 8 px (tarjetas, botones), `radio.lg` 12 px (modales y paneles).
- **Elevación** con tres niveles: `sombra.sm` (tarjetas), `sombra.md` (menús), `sombra.lg` (modales). En el tema oscuro se distingue por superficie y borde, no por sombra.
- **Objetivos táctiles:** web mínimo 24 × 24 px (WCAG 2.2); **móvil mínimo 48 × 48 px**, y los botones principales del técnico 56 px de alto.
- **Densidad de tabla:** filas de 36 px en web (compacta) y 56 px en móvil.

## 6. Estados

### 6.1 Estado de la OS

| Estado     | Chip claro (texto / fondo)  | Icono                 |
| ---------- | --------------------------- | --------------------- |
| Registrada | `#3F4D59` / `#E6E9EC` (7,1) | círculo vacío         |
| En curso   | `#004B72` / `#DCEBF4` (7,7) | flecha o reloj        |
| Cerrada    | `#17703E` / `#DDF3E5` (5,3) | marca de verificación |

### 6.2 Indicadores de plazo (SLA)

| Indicador | Chip claro (texto / fondo)  | Icono              |
| --------- | --------------------------- | ------------------ |
| En riesgo | `#8F5F12` / `#FBEFD3` (4,8) | triángulo de aviso |
| Vencida   | `#A92A2A` / `#FBE3E3` (5,6) | círculo de alerta  |

En el tema oscuro los chips usan el color del tema (`primario`, `exito`, `advertencia`, `error`, `texto-secundario`) sobre `color.superficie`, todos por encima de 4,5. Un chip siempre lleva **texto + icono + color**.

## 7. Componentes base

Quince componentes en `packages/ui`. Todos tienen estados: normal, hover, foco, activo, deshabilitado y, si aplica, error y cargando.

| Componente         | Reglas clave                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Botón              | Variantes: primario (azul), secundario (borde), fantasma, peligro. Un solo primario por vista.                       |
| Campo              | Etiqueta siempre visible (no solo marcador de posición), ayuda y mensaje de error enlazados por `aria-describedby`.  |
| Selector           | Con búsqueda cuando hay más de 7 opciones. Teclado completo.                                                         |
| Fecha              | Escritura manual y calendario. Formato `dd/mm/aaaa`.                                                                 |
| Casilla            | Área clicable incluye la etiqueta. Estado intermedio soportado.                                                      |
| Chip de estado     | Ver sección 6. No es un botón.                                                                                       |
| Avatar             | Imagen o iniciales; tamaños 24, 32, 40. Texto alternativo con el nombre.                                             |
| Insignia           | Contadores y marcas ("Nuevo"). Texto, no solo color.                                                                 |
| Tabla densa        | Cabecera fija, columnas ordenables, selección múltiple, filas de 36 px, navegación con flechas.                      |
| Tarjeta de tablero | Título, chip de estado, responsable (avatar), plazo. Arrastrable con alternativa por teclado.                        |
| Modal              | Atrapa el foco, cierra con `Esc`, devuelve el foco al disparador.                                                    |
| Panel lateral      | Detalle de OS a la derecha; no bloquea la lista.                                                                     |
| Aviso              | Éxito, información, advertencia y error. Anunciado con `role="status"` o `role="alert"`. No desaparece antes de 6 s. |
| Barra lateral      | Jerarquía empresa → proyectos; colapsa a iconos con etiqueta accesible.                                              |
| Paleta de comandos | `Ctrl+K` / `Cmd+K`; resultados agrupados; ejecuta con `Enter`.                                                       |

Foco visible en todos: anillo de 2 px del color `color.foco` con separación de 2 px. Nunca se elimina el contorno de foco.

## 8. Pantallas plantilla

Cinco, en web y móvil, con datos simulados (sin conexión a la API hasta el paso 0.6):

1. **Inicio de sesión**, con el logo de la empresa.
2. **Panel** (resumen: OS por estado, en riesgo, vencidas).
3. **Listado de OS**, con vista lista y vista tablero.
4. **Formulario de OS** (abonado, descripción, tipo de falla, ubicación opcional).
5. **Detalle de OS**, como panel lateral en web y pantalla completa en móvil.

## 9. Móvil (técnico de campo)

- Botones grandes (48 px mínimo, 56 px los principales), acciones principales a un toque y alcanzables con el pulgar (parte inferior de la pantalla).
- Contraste alto y tamaño de texto base de 16 px, legible a pleno sol.
- Estado de **sin conexión** siempre visible, con cuántos cambios esperan sincronizar (ADR 021).
- Los mismos tokens que la web, aplicados con NativeWind. Componentes propios de móvil; no se reutilizan los de shadcn.

## 10. Marca por empresa

- **Solo cambia el logo.** Colores, tipografía y componentes son comunes a todas las empresas.
- El logo de la empresa aparece en la **barra lateral**, el **inicio de sesión** y la **app móvil**.
- Espacio reservado: máximo 160 × 40 px en web y 120 × 32 px en móvil. Formatos SVG o PNG con fondo transparente; se muestra una variante clara u oscura según el tema.
- Si la empresa no tiene logo, se muestra su nombre en texto.
- El logo de Orbyta es independiente y se agrega al final del paso; hasta entonces, un marcador temporal.

## 11. Accesibilidad (WCAG 2.2 AA)

- Contraste de texto 4,5:1 (3:1 en texto grande) y de componentes e iconos 3:1, en **ambos temas**.
- Todo se maneja con teclado; orden de foco lógico; sin trampas de foco.
- No se transmite información solo por color.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme` (el usuario puede forzar un tema).
- Etiquetas, roles y nombres accesibles en todos los controles. Mensajes de error asociados al campo.
- Verificación automática con axe-core en Storybook y en el pipeline (**cero violaciones graves**), más revisión manual del revisor.

## 12. Idioma y textos

- **Español de Ecuador** por defecto. Fechas `dd/mm/aaaa`, hora de 24 horas, moneda en USD.
- Textos **externalizados** (no escritos en los componentes) para permitir otros idiomas.
- Usar el lenguaje ubicuo del [glosario](../fase0/glosario.md): Proyecto, Tarea, Hito, Orden de servicio (OS), Abonado, Punto de servicio, Técnico, Cuadrilla, Tipo de falla, Estado de la OS, SLA, Contrato.
- Tono directo y respetuoso; mensajes de error que dicen qué pasó y cómo corregirlo.
- Datos personales de abonados: nunca en URLs, logs ni textos de ejemplo reales (LOPDP).

## 13. Fuera de alcance de esta guía (diferido)

Vistas de calendario y cronograma, y el diseño en Penpot (ver [deuda planificada](../fase0/deuda-planificada.md), ítem 12).
