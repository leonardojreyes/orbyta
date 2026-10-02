# modules/

Un directorio por módulo de negocio: `modules/<modulo>/{domain,application,infrastructure,interface}`. Mapa y estado en `docs/architecture/modulos.md`.

## Capas y dependencias (las impone Nx con etiquetas)
| Capa | Etiqueta | Puede importar |
| --- | --- | --- |
| `domain` | `type:domain` | solo `domain` |
| `application` | `type:application` | `domain`, `application` (puertos aquí) |
| `infrastructure` | `type:infrastructure` | `domain`, `application`, `lib` |
| `interface` | `type:interface` | `domain`, `application`, `lib` — nunca `infrastructure` |

Todo proyecto lleva también `scope:<modulo>`. Un módulo no importa capas internas de otro: se comunican por contratos (`packages/contracts`) o eventos.

## Reglas
- **Dominio puro:** sin NestJS, base de datos, ERP, IA ni `Date.now()` directo (inyecta un reloj por puerto).
- Todo lo que toca datos lleva la empresa; sin empresa, falla.
- Pruebas primero; cobertura mínima 80 % en `domain` y `application`.
- Nombres de proyecto Nx **únicos**: `<modulo>-<capa>` (ej. `ping-domain`) y paquete `@orbyta/<modulo>-<capa>`.
  (Los de `ordenes-servicio` se llaman `domain`, `application`, etc. por origen; no copies ese patrón.)
- Usa la skill `crear-modulo` para módulos nuevos.
