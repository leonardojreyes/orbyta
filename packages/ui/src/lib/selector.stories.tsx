import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Selector } from './selector';

const pocas = ['Fuga de agua', 'Sin servicio', 'Baja presión'].map((e) => ({
  valor: e,
  etiqueta: e,
}));
const muchas = Array.from({ length: 12 }, (_, i) => ({
  valor: `a${i}`,
  etiqueta: `Abonado ${String(i + 1).padStart(4, '0')}`,
}));

const meta = {
  title: 'Componentes/Selector',
  component: Selector,
} satisfies Meta<typeof Selector>;
export default meta;
type Historia = StoryObj<typeof meta>;

const Controlado = ({
  etiqueta,
  opciones,
  error,
}: {
  etiqueta: string;
  opciones: typeof pocas;
  error?: string;
}) => {
  const [valor, setValor] = useState('');
  return (
    <Selector
      etiqueta={etiqueta}
      opciones={opciones}
      valor={valor}
      onCambio={setValor}
      error={error}
    />
  );
};

export const PocasOpciones: Historia = {
  args: {
    etiqueta: 'Tipo de falla',
    opciones: pocas,
    valor: '',
    onCambio: () => undefined,
  },
  render: () => <Controlado etiqueta="Tipo de falla" opciones={pocas} />,
};
export const ConBusqueda: Historia = {
  args: {
    etiqueta: 'Abonado',
    opciones: muchas,
    valor: '',
    onCambio: () => undefined,
  },
  render: () => <Controlado etiqueta="Abonado" opciones={muchas} />,
};
export const ConError: Historia = {
  args: {
    etiqueta: 'Tipo de falla',
    opciones: pocas,
    valor: '',
    onCambio: () => undefined,
  },
  render: () => (
    <Controlado
      etiqueta="Tipo de falla"
      opciones={pocas}
      error="Este campo es obligatorio."
    />
  ),
};
