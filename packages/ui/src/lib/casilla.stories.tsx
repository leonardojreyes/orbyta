import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Casilla } from './casilla';

const meta = {
  title: 'Componentes/Casilla',
  component: Casilla,
  args: {
    etiqueta: 'Notificarme por correo',
    marcada: false,
    onCambio: () => undefined,
  },
} satisfies Meta<typeof Casilla>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Interactiva: Historia = {
  render: (args) => {
    const [marcada, setMarcada] = useState(false);
    return <Casilla {...args} marcada={marcada} onCambio={setMarcada} />;
  },
};
export const Marcada: Historia = { args: { marcada: true } };
export const Intermedia: Historia = {
  args: { marcada: 'indeterminada', etiqueta: 'Todas las órdenes' },
};
export const Deshabilitada: Historia = { args: { deshabilitada: true } };
