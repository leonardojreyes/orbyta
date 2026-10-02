import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boton } from './boton';
import { Modal, PanelLateral } from './modal';

const meta = {
  title: 'Componentes/Modal y panel lateral',
  component: Modal,
} satisfies Meta<typeof Modal>;
export default meta;
type Historia = StoryObj<typeof meta>;

const base = {
  abierto: true,
  onCambio: () => undefined,
  titulo: 'Cerrar orden',
  children: null,
};

export const VentanaModal: Historia = {
  args: base,
  render: () => {
    const [abierto, setAbierto] = useState(true);
    return (
      <>
        <Boton onClick={() => setAbierto(true)}>Abrir modal</Boton>
        <Modal
          abierto={abierto}
          onCambio={setAbierto}
          titulo="Cerrar orden"
          descripcion="Esta acción registra el cierre y no se puede deshacer."
          pie={
            <>
              <Boton variante="secundario" onClick={() => setAbierto(false)}>
                Cancelar
              </Boton>
              <Boton onClick={() => setAbierto(false)}>Cerrar orden</Boton>
            </>
          }
        >
          <p>¿Confirmas que la falla fue resuelta?</p>
        </Modal>
      </>
    );
  },
};

export const Panel: Historia = {
  args: base,
  render: () => {
    const [abierto, setAbierto] = useState(true);
    return (
      <>
        <Boton onClick={() => setAbierto(true)}>Abrir panel</Boton>
        <PanelLateral
          abierto={abierto}
          onCambio={setAbierto}
          titulo="OS-0001"
          descripcion="Detalle de la orden"
        >
          <p>Contenido del detalle.</p>
        </PanelLateral>
      </>
    );
  },
};
