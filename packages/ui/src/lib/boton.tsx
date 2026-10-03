'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { es } from '../i18n';
import { anilloFoco, cn } from './utilidades';

const variantes = cva(
  [
    'inline-flex items-center justify-center gap-espacio-2 rounded-md font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    anilloFoco,
  ],
  {
    variants: {
      variante: {
        primario: 'bg-primario text-primario-texto hover:bg-primario-hover',
        secundario:
          'border border-borde-campo bg-superficie text-texto hover:bg-fondo',
        fantasma: 'bg-transparent text-primario hover:bg-fondo',
        peligro: 'bg-error text-error-texto hover:opacity-90',
      },
      tamano: {
        md: 'min-h-fila-web px-espacio-4 text-md',
        lg: 'min-h-tactil-movil px-espacio-5 text-lg',
      },
    },
    defaultVariants: { variante: 'primario', tamano: 'md' },
  },
);

export interface BotonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variantes> {
  cargando?: boolean;
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  {
    variante,
    tamano,
    cargando = false,
    disabled,
    className,
    children,
    type = 'button',
    ...resto
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cn(variantes({ variante, tamano }), className)}
      {...resto}
    >
      {cargando ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : null}
      {cargando ? <span className="sr-only">{es.comunes.cargando}</span> : null}
      {children}
    </button>
  );
});
