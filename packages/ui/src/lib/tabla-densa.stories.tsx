import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ordenesEjemplo,
  estadoVisible,
  formatearFecha,
  type OrdenEjemplo,
} from '../ejemplos';
import { ChipEstado } from './chip-estado';
import { TablaDensa, type Columna } from './tabla-densa';

const columnas: Columna<OrdenEjemplo>[] = [
  {
    id: 'numero',
    encabezado: 'N.º',
    celda: (o) => o.numero,
    valorOrden: (o) => o.numero,
  },
  { id: 'descripcion', encabezado: 'Descripción', celda: (o) => o.descripcion },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (o) => <ChipEstado estado={estadoVisible(o)} />,
    valorOrden: (o) => estadoVisible(o),
  },
  {
    id: 'plazo',
    encabezado: 'Plazo',
    celda: (o) => formatearFecha(o.vence),
    valorOrden: (o) => o.vence,
  },
];

const meta = {
  title: 'Componentes/Tabla densa',
  component: TablaDensa<OrdenEjemplo>,
} satisfies Meta<typeof TablaDensa<OrdenEjemplo>>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Basica: Historia = {
  args: {
    descripcion: 'Órdenes de servicio',
    columnas,
    filas: ordenesEjemplo,
    idFila: (o) => o.id,
  },
};
export const ConSeleccion: Historia = {
  args: {
    descripcion: 'Órdenes de servicio',
    columnas,
    filas: ordenesEjemplo,
    idFila: (o) => o.id,
  },
  render: (args) => {
    const [sel, setSel] = useState<Set<string>>(new Set(['os-0002']));
    return <TablaDensa {...args} seleccionadas={sel} onSeleccion={setSel} />;
  },
};
