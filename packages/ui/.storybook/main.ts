import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  // El logo vive en docs/design/marca y se sirve como /marca/orbyta-logo.svg, igual que en la web.
  staticDirs: [{ from: '../../../docs/design/marca', to: '/marca' }],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  typescript: { reactDocgen: false },
};

export default config;
