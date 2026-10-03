import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar';

const meta = {
  title: 'Componentes/Avatar',
  component: Avatar,
  args: { nombre: 'Ana Pérez' },
} satisfies Meta<typeof Avatar>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Iniciales: Historia = {};
export const Tamanos: Historia = {
  render: () => (
    <div className="flex items-center gap-espacio-3">
      {([24, 32, 40] as const).map((t) => (
        <Avatar key={t} nombre="Luis Andrade" tamano={t} />
      ))}
    </div>
  ),
};
