import type { Metadata } from 'next';
import { es } from '@orbyta/ui/textos';
import { VistaOrdenes } from '../../../componentes/vista-ordenes';

export const metadata: Metadata = { title: es.ordenes.titulo };

export default function PaginaOrdenes() {
  return <VistaOrdenes />;
}
