import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChipEstado } from './chip-estado';

const meta = {
  title: 'Componentes/Chip de estado',
  component: ChipEstado,
  args: { estado: 'registrada' },
} satisfies Meta<typeof ChipEstado>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Registrada: Historia = {};
export const EnCurso: Historia = { args: { estado: 'en_curso' } };
export const Cerrada: Historia = { args: { estado: 'cerrada' } };
export const EnRiesgo: Historia = { args: { estado: 'en_riesgo' } };
export const Vencida: Historia = { args: { estado: 'vencida' } };
export const Todos: Historia = {
  render: () => (
    <div className="flex flex-wrap gap-espacio-2">
      {(
        ['registrada', 'en_curso', 'cerrada', 'en_riesgo', 'vencida'] as const
      ).map((e) => (
        <ChipEstado key={e} estado={e} />
      ))}
    </div>
  ),
};
