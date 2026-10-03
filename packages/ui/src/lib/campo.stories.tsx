import type { Meta, StoryObj } from '@storybook/react-vite';
import { Campo, CampoFecha } from './campo';

const meta = {
  title: 'Componentes/Campo',
  component: Campo,
  args: { etiqueta: 'Usuario' },
} satisfies Meta<typeof Campo>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Normal: Historia = {};
export const ConAyuda: Historia = {
  args: { ayuda: 'Tu usuario institucional' },
};
export const ConError: Historia = {
  args: { error: 'Este campo es obligatorio.', required: true },
};
export const Opcional: Historia = {
  args: { etiqueta: 'Ubicación', opcional: true },
};
export const Deshabilitado: Historia = {
  args: { disabled: true, value: 'No editable' },
};
export const Fecha: StoryObj<typeof CampoFecha> = {
  render: () => <CampoFecha etiqueta="Fecha programada" />,
};
