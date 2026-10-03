import type { Metadata } from 'next';
import { es } from '@orbyta/ui/textos';
import { FormularioOrden } from '../../../../componentes/formulario-orden';

export const metadata: Metadata = { title: es.formulario.titulo };

export default function PaginaNuevaOrden() {
  return <FormularioOrden />;
}
