import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoOrbyta } from './logo-orbyta';

const meta = {
  title: 'Marca/Logo de Orbyta',
  component: LogoOrbyta,
} satisfies Meta<typeof LogoOrbyta>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Grande: Historia = { args: { className: 'w-96 h-auto' } };
