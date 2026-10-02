import type { Metadata } from 'next';
import { es } from '@orbyta/ui/textos';
import { PanelResumen } from '../../componentes/panel-resumen';

export const metadata: Metadata = { title: es.panel.titulo };

export default function PaginaPanel() {
  return <PanelResumen />;
}
