---
name: crear-modulo
description: Crea un módulo de negocio nuevo en modules/<modulo> con sus cuatro capas (domain, application, infrastructure, interface), etiquetas de Nx y rutas de importación. Úsala cuando haya que agregar un módulo o scaffolding de una funcionalidad nueva.
---

# crear-modulo

Argumento: nombre del módulo en kebab-case (ej. `abonados`). Verifica antes que esté en `docs/architecture/modulos.md`; si no, pregunta o usa `/adr`.

## Pasos

1. Rama `fase0/<paso>` activa (nunca `main`).
2. Genera las cuatro capas. Reemplaza `<m>`; el nombre del proyecto debe ser **único** (`<m>-<capa>`):

```bash
pnpm nx g @nx/js:library --name=<m>-domain         --directory=modules/<m>/domain         --importPath=@orbyta/<m>-domain         --bundler=tsc --unitTestRunner=jest --linter=eslint --tags="scope:<m>,type:domain"
pnpm nx g @nx/js:library --name=<m>-application    --directory=modules/<m>/application    --importPath=@orbyta/<m>-application    --bundler=tsc --unitTestRunner=jest --linter=eslint --tags="scope:<m>,type:application"
pnpm nx g @nx/js:library --name=<m>-infrastructure --directory=modules/<m>/infrastructure --importPath=@orbyta/<m>-infrastructure --bundler=tsc --unitTestRunner=jest --linter=eslint --tags="scope:<m>,type:infrastructure"
pnpm nx g @nx/js:library --name=<m>-interface      --directory=modules/<m>/interface      --importPath=@orbyta/<m>-interface      --bundler=tsc --unitTestRunner=jest --linter=eslint --tags="scope:<m>,type:interface"
```

3. Las dependencias entre capas (`"@orbyta/<m>-domain": "workspace:*"` en el `package.json`) se declaran **cuando el código las importa**, no antes: el lint `@nx/dependency-checks` falla si hay dependencias declaradas sin uso (o usadas sin declarar; `pnpm nx lint <proyecto> --fix` las agrega, pero con la versión `0.0.1`: cámbiala a `workspace:*`). Permitidas: application → domain; infrastructure → domain, application; interface → domain, application. **interface nunca depende de infrastructure.** Ejecuta `pnpm install` tras declararlas.
4. Reemplaza el código de ejemplo generado (`src/lib/<m>-<capa>.ts` y su spec) por contenido real o bórralo; deja `src/index.ts` exportando solo la API pública de la capa.
5. Dominio sin frameworks ni `Date.now()` directo; puertos en `application`; adaptadores en `infrastructure`.
6. Agrega la entrada del módulo a `docs/architecture/modulos.md` si no estaba.
7. Verifica: `pnpm nx run-many -t lint test build -p <m>-domain <m>-application <m>-infrastructure <m>-interface`. Prueba también que una importación prohibida (ej. interface → infrastructure) **falla** el lint, y revierte la prueba.

## Criterio de terminado

Las cuatro capas con etiquetas `scope:<m>` y `type:*`, lint, pruebas y build en verde, grafo (`pnpm nx graph`) sin dependencias prohibidas.
