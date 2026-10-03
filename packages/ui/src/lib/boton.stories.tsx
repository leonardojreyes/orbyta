import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boton } from './boton';

const meta = {
  title: 'Componentes/Botón',
  component: Boton,
  args: { children: 'Guardar' },
} satisfies Meta<typeof Boton>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Primario: Historia = {};
export const Secundario: Historia = { args: { variante: 'secundario' } };
export const Fantasma: Historia = { args: { variante: 'fantasma' } };
export const Peligro: Historia = {
  args: { variante: 'peligro', children: 'Eliminar' },
};
export const Deshabilitado: Historia = { args: { disabled: true } };
export const Cargando: Historia = { args: { cargando: true } };
export const Grande: Historia = {
  args: { tamano: 'lg', children: 'Cerrar orden' },
};
