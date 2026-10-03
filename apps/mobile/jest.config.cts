/// <reference types="jest" />
/// <reference types="node" />
module.exports = {
  displayName: 'mobile',
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '[.]svg$': '@nx/expo/plugins/jest/svg-mock',
    // Rutas de tsconfig.base.json que jest-expo no resuelve por sí solo.
    '^@orbyta/ui/textos$': '<rootDir>/../../packages/ui/src/i18n/index.ts',
    '^@orbyta/ui/ejemplos$':
      '<rootDir>/../../packages/ui/src/ejemplos/index.ts',
    '^@orbyta/tokens$': '<rootDir>/../../packages/tokens/src/index.ts',
  },
  transform: {
    '[.][jt]sx?$': [
      'babel-jest',
      {
        configFile: __dirname + '/.babelrc.js',
      },
    ],
    '^.+[.](bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf|otf|m4v|mov|mp4|mpeg|mpg|webm|aac|aiff|caf|m4a|mp3|wav|html|pdf|obj)$':
      require.resolve('jest-expo/src/preset/assetFileTransformer.js'),
  },
  coverageDirectory: '../../coverage/apps/mobile',
};
