import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boton } from './boton';
import { PaletaComandos, useAtajoPaleta } from './paleta-comandos';

const meta = {
  title: 'Componentes/Paleta de comandos',
  component: PaletaComandos,
} satisfies Meta<typeof PaletaComandos>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Abierta: Historia = {
  args: { abierta: true, onCambio: () => undefined, comandos: [] },
  render: () => {
    const [abierta, setAbierta] = useState(true);
    useAtajoPaleta(() => setAbierta(true));
    return (
      <>
        <Boton onClick={() => setAbierta(true)}>Abrir (Ctrl+K)</Boton>
        <PaletaComandos
          abierta={abierta}
          onCambio={setAbierta}
          comandos={[
            {
              id: 'nueva',
              grupo: 'Acciones',
              etiqueta: 'Nueva orden',
              atajo: 'N',
              ejecutar: () => undefined,
            },
            {
              id: 'ordenes',
              grupo: 'Navegación',
              etiqueta: 'Órdenes de servicio',
              ejecutar: () => undefined,
            },
            {
              id: 'proyectos',
              grupo: 'Navegación',
              etiqueta: 'Proyectos',
              ejecutar: () => undefined,
            },
          ]}
        />
      </>
    );
  },
};
