<!-- Presupuesto: máximo 30 líneas. Se carga solo cuando Claude trabaja en este módulo. -->
# Módulo marca

**Propósito:** logo y color primario de cada empresa, con color predeterminado accesible.
**Entidades:** `MarcaEmpresa` (empresaId inmutable, colorPrimario `#RRGGBB`, logoId opcional).
**Casos de uso:** `ObtenerMarca`, `ObtenerLogo`, `GuardarMarca`.
**Puertos que usa:** `RepositorioMarca` (propio); `AlmacenArchivos` (`platform/archivos`).
**Eventos que publica / consume:** ninguno.
**Depende de los módulos:** ninguno (comunicación por eventos o puertos)
**Spec de origen:** `docs/specs/look-and-feel/`

## Reglas propias del módulo
- Color: texto sobre primario ≥ 4,5:1 y primario contra fondo de cada tema ≥ 3:1; si no, no se guarda y `ObtenerMarca` devuelve la predeterminada.
- `COLOR_PRIMARIO_PREDETERMINADO` duplica el token `color.primario`; la prueba cruzada vive en `apps/api`.
- Logo: solo PNG por firma de bytes, máximo 256 KB.
- `GuardarMarca` guarda el archivo, luego la fila; si la fila falla borra el archivo nuevo; al éxito borra el anterior.
- Sin ruta HTTP aquí; la entrada es el script de carga de `apps/api`.
