import type { Meta, StoryObj } from '@storybook/react-vite';
import { Insignia } from './insignia';

const meta = {
  title: 'Componentes/Insignia',
  component: Insignia,
  args: { children: '12' },
} satisfies Meta<typeof Insignia>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Neutra: Historia = {};
export const Primaria: Historia = {
  args: { variante: 'primaria', children: 'Nuevo' },
};
