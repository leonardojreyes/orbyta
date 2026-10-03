import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { es } from '@orbyta/ui/textos';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: es.marca.logoOrbyta,
    template: `%s · ${es.marca.logoOrbyta}`,
  },
  description: 'Plataforma de proyectos y órdenes de servicio',
};

/** Aplica el tema guardado antes de pintar, para evitar el parpadeo entre claro y oscuro. */
const scriptTema = `try{var t=localStorage.getItem('orbyta-tema');if(t==='claro'||t==='oscuro'){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-EC" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
