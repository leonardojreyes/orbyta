import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoEmpresa } from './logo-empresa';

const meta = {
  title: 'Componentes/Logo de la empresa',
  component: LogoEmpresa,
  args: { nombre: 'Agua Potable Ejemplo' },
} satisfies Meta<typeof LogoEmpresa>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const SoloNombre: Historia = {};
