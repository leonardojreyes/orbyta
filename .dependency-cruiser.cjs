/** Límites de arquitectura (ADR 001). Se ejecuta con `pnpm limites` y en el CI. */
module.exports = {
  forbidden: [
    {
      name: 'dominio-puro',
      comment: 'El dominio no importa frameworks, base de datos, SDKs ni adaptadores.',
      severity: 'error',
      from: { path: '^modules/[^/]+/domain' },
      to: {
        path: '^(platform|apps|packages)/|^modules/[^/]+/(application|infrastructure|interface)',
        pathNot: '^modules/[^/]+/domain',
      },
    },
    {
      name: 'dominio-sin-paquetes-externos',
      severity: 'error',
      from: { path: '^modules/[^/]+/domain' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional', 'npm-no-pkg'] },
    },
    {
      name: 'application-sin-infraestructura',
      comment: 'Los casos de uso dependen de puertos, no de adaptadores.',
      severity: 'error',
      from: { path: '^modules/[^/]+/application' },
      to: { path: '^modules/[^/]+/(infrastructure|interface)|^platform/[^/]+/adapters' },
    },
    {
      name: 'modulos-aislados',
      comment: 'Un módulo no importa a otro; se comunican por puertos o eventos.',
      severity: 'error',
      from: { path: '^modules/([^/]+)/' },
      to: { path: '^modules/([^/]+)/', pathNot: '^modules/$1/' },
    },
    {
      name: 'adaptadores-solo-en-composicion',
      comment: 'Solo la raíz de composición (apps/api) conoce los adaptadores de platform.',
      severity: 'error',
      from: { pathNot: '^(apps/api|platform/[^/]+)/' },
      to: { path: '^platform/[^/]+/adapters' },
    },
    {
      name: 'sin-circulares',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|coverage|\\.turbo)/|\\.test\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
  },
};
