import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import './preview.css';

/** Aplica el tema elegido en la barra de herramientas, igual que la aplicación web. */
const conTema: Decorator = (Story, contexto) => {
  const tema = contexto.globals['tema'] as 'claro' | 'oscuro';
  useEffect(() => {
    document.documentElement.dataset['theme'] = tema;
  }, [tema]);
  return (
    <div className="bg-fondo p-espacio-4 text-texto">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [conTema],
  globalTypes: {
    tema: {
      description: 'Tema de color',
      toolbar: {
        title: 'Tema',
        icon: 'contrast',
        items: ['claro', 'oscuro'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { tema: 'claro' },
  parameters: {
    layout: 'fullscreen',
    // Las violaciones de accesibilidad hacen fallar la historia (revisión del paso 0.5).
    a11y: { test: 'error' },
  },
};

export default preview;
