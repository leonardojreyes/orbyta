import { useState } from 'react';
import { ClipboardList, FolderKanban, Home } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarraLateral, type ItemNavegacion } from './barra-lateral';
import { LogoEmpresa } from './logo-empresa';

const items: ItemNavegacion[] = [
  { id: 'inicio', etiqueta: 'Inicio', icono: Home, activo: true },
  {
    id: 'ordenes',
    etiqueta: 'Órdenes de servicio',
    icono: ClipboardList,
    contador: 5,
  },
  {
    id: 'proyectos',
    etiqueta: 'Proyectos',
    icono: FolderKanban,
    hijos: [
      { id: 'norte', etiqueta: 'Red norte' },
      { id: 'sur', etiqueta: 'Red sur' },
    ],
  },
];

const meta = {
  title: 'Componentes/Barra lateral',
  component: BarraLateral,
} satisfies Meta<typeof BarraLateral>;
export default meta;
type Historia = StoryObj<typeof meta>;

const Armada = ({ inicial }: { inicial: boolean }) => {
  const [colapsada, setColapsada] = useState(inicial);
  return (
    <div className="h-96">
      <BarraLateral
        logo={<LogoEmpresa nombre="Agua Potable Ejemplo" />}
        items={items}
        colapsada={colapsada}
        onAlternar={() => setColapsada((c) => !c)}
      />
    </div>
  );
};

export const Expandida: Historia = {
  args: { logo: null, items, colapsada: false, onAlternar: () => undefined },
  render: () => <Armada inicial={false} />,
};
export const Contraida: Historia = {
  args: { logo: null, items, colapsada: true, onAlternar: () => undefined },
  render: () => <Armada inicial />,
};
