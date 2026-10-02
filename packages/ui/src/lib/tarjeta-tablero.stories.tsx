import type { Meta, StoryObj } from '@storybook/react-vite';
import { TarjetaTablero } from './tarjeta-tablero';

const meta = {
  title: 'Componentes/Tarjeta de tablero',
  component: TarjetaTablero,
  args: {
    titulo: 'OS-0001 · Fuga de agua frente al medidor',
    estado: 'en_riesgo',
    responsable: 'Ana Pérez',
    plazo: '05/10/2026',
  },
  decorators: [
    (Historia) => (
      <div className="w-72">
        <Historia />
      </div>
    ),
  ],
} satisfies Meta<typeof TarjetaTablero>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const EnRiesgo: Historia = {};
export const SinResponsable: Historia = {
  args: { responsable: undefined, estado: 'vencida' },
};
export const ConMovimientoPorTeclado: Historia = {
  args: {
    destinos: [{ valor: 'cerrada', etiqueta: 'Cerrada' }],
    onMover: () => undefined,
  },
};
