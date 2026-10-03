'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { anilloFoco, cn } from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';

type Tema = 'claro' | 'oscuro';

const temaActual = (): Tema => {
  const forzado = document.documentElement.dataset['theme'];
  if (forzado === 'claro' || forzado === 'oscuro') return forzado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'oscuro'
    : 'claro';
};

/** Alterna entre tema claro y oscuro y recuerda la elección del usuario. */
export function ConmutadorTema() {
  const [tema, setTema] = useState<Tema>('claro');
  useEffect(() => setTema(temaActual()), []);

  const alternar = () => {
    const siguiente: Tema = tema === 'claro' ? 'oscuro' : 'claro';
    document.documentElement.dataset['theme'] = siguiente;
    try {
      localStorage.setItem('orbyta-tema', siguiente);
    } catch {
      // Sin almacenamiento: el cambio vale solo para esta sesión.
    }
    setTema(siguiente);
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`${es.tema.cambiar}: ${tema === 'claro' ? es.tema.oscuro : es.tema.claro}`}
      className={cn(
        'flex min-h-tactil-web min-w-tactil-web items-center justify-center rounded-md p-espacio-2 text-texto hover:bg-fondo',
        anilloFoco,
      )}
    >
      {tema === 'claro' ? (
        <Moon aria-hidden className="h-5 w-5" />
      ) : (
        <Sun aria-hidden className="h-5 w-5" />
      )}
    </button>
  );
}
