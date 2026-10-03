'use client';

import type { ReactNode } from 'react';
import { cn } from './utilidades';

export interface InsigniaProps {
  children: ReactNode;
  variante?: 'neutra' | 'primaria';
  className?: string;
}

/** Contadores y marcas ("Nuevo"). Siempre con texto o número, no solo color. */
export function Insignia({
  children,
  variante = 'neutra',
  className,
}: InsigniaProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full px-espacio-2 text-xs font-medium',
        variante === 'primaria'
          ? 'bg-primario text-primario-texto'
          : 'bg-chip-neutro-fondo text-chip-neutro-texto',
        className,
      )}
    >
      {children}
    </span>
  );
}
