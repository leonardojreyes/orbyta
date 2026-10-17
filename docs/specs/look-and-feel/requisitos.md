# Look and feel (paso 0.5)

**Fase:** 0 · **Estado:** Especificada · **Referencias:** FASE0 §5.4, ADR 013

## Objetivo
Definir el sistema visual de orbyta: tokens, tema claro y oscuro, marca por empresa, ~8 componentes base y 3 pantallas plantilla. Estilo moderno y cercano; tuteo en español de Ecuador.

## Usuarios
- Persona usuaria final de una empresa: ve la app con la marca de su empresa.
- Equipo de desarrollo: construye pantallas solo con tokens y componentes.
- Responsable de SynapTech: aprueba el catálogo.

## Historias
1. Como persona usuaria, quiero ver el logo y el color de mi empresa, para reconocer mi entorno.
2. Como persona usuaria, quiero elegir tema claro u oscuro, para trabajar cómoda.
3. Como desarrollador, quiero componentes y tokens, para no escribir valores visuales a mano.
4. Como responsable, quiero un catálogo navegable, para aprobar el look and feel.

## Criterios de aceptación
1. **Tokens.** Dado el código de `apps/web` y `packages/ui`, cuando corre `pnpm lint`, entonces falla si hay colores, tamaños o fuentes literales fuera de los tokens.
2. **Contraste de tema.** Dados los tokens de color, cuando se evalúa cada par texto/fondo en claro y en oscuro, entonces el texto cumple 4,5:1 y los componentes 3:1 (WCAG 2.2 AA).
3. **Marca válida.** Dada una empresa con logo y color primario válidos, cuando carga la app, entonces se aplican su logo y su color.
4. **Marca inválida.** Dada una empresa con un color primario que no cumple AA en claro u oscuro, cuando se guarda o carga su configuración, entonces se rechaza con un mensaje claro y se usa el color predeterminado.
5. **Aislamiento de marca.** Dadas las empresas A y B, cuando una persona de A carga la app, entonces nunca recibe el logo ni el color de B (prueba contra PostgreSQL real, empresa fijada).
6. **Tema.** Dada la app cargada, cuando la persona cambia el tema, entonces cambia sin recargar y se conserva en su próxima visita; el valor inicial sigue la preferencia del sistema.
7. **Componentes.** Dado el catálogo en la app web, cuando se revisa cada componente base (botón, campo de texto, selector, tabla, tarjeta, alerta, diálogo, navegación), entonces se opera con teclado, muestra foco visible y tiene nombre accesible.
8. **Pantallas plantilla.** Dadas las pantallas de inicio de sesión, listado con filtros y formulario, cuando se renderizan en claro y en oscuro, entonces no tienen violaciones de accesibilidad en la verificación automática.
9. **Textos.** Dado el código de los componentes, cuando corre el lint, entonces no hay cadenas visibles literales; todas salen del catálogo de textos en español de Ecuador (tuteo).
10. **Fuente.** Dada la app en producción, cuando carga, entonces la fuente se sirve desde el propio dominio, con licencia OFL registrada y sin peticiones a CDN externos.
11. **Catálogo aprobado.** Dado el catálogo completo, cuando el responsable lo revisa, entonces queda registrada su aprobación en `docs/estado.md` al cerrar el paso.

## Datos personales
Ninguno nuevo. El logo y el color son datos de la empresa, no de personas. La preferencia de tema se guarda en el navegador sin identificar a la persona.

## Fuera de alcance
- Pantalla de administración de marca (la marca se lee de la configuración de la empresa, cargada por datos).
- Densidad compacta, segundo color de marca y fuentes de marca propia.
- Versión móvil nativa e internacionalización a otros idiomas.
- Pantallas de negocio de módulos.
