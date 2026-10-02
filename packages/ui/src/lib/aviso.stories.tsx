import type { Meta, StoryObj } from '@storybook/react-vite';
import { Aviso } from './aviso';

const meta = {
  title: 'Componentes/Aviso',
  component: Aviso,
  args: { tipo: 'info', children: 'La orden se actualizó.' },
} satisfies Meta<typeof Aviso>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Informacion: Historia = {};
export const Exito: Historia = {
  args: {
    tipo: 'exito',
    titulo: 'Orden creada',
    children: 'La orden OS-0006 quedó registrada.',
  },
};
export const Advertencia: Historia = {
  args: {
    tipo: 'advertencia',
    children: 'El plazo vence en menos de 24 horas.',
  },
};
export const Error: Historia = {
  args: {
    tipo: 'error',
    titulo: 'No se pudo guardar',
    children: 'Revisa los datos e inténtalo de nuevo.',
    onCerrar: () => undefined,
  },
};
