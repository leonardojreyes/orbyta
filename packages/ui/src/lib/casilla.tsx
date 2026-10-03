'use client';

import { useId } from 'react';
import { Checkbox } from 'radix-ui';
import { Check, Minus } from 'lucide-react';
import { anilloFoco, cn } from './utilidades';

export interface CasillaProps {
  etiqueta: string;
  marcada: boolean | 'indeterminada';
  onCambio: (marcada: boolean) => void;
  deshabilitada?: boolean;
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  etiquetaOculta?: boolean;
  id?: string;
}

export function Casilla({
  etiqueta,
  marcada,
  onCambio,
  deshabilitada,
  etiquetaOculta,
  id,
}: CasillaProps) {
  const generado = useId();
  const idCasilla = id ?? generado;
  return (
    <div className="flex min-h-tactil-web items-center gap-espacio-2">
      <Checkbox.Root
        id={idCasilla}
        checked={marcada === 'indeterminada' ? 'indeterminate' : marcada}
        onCheckedChange={(v) => onCambio(v === true)}
        disabled={deshabilitada}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-borde-campo bg-superficie',
          'data-[state=checked]:border-primario data-[state=checked]:bg-primario data-[state=indeterminate]:border-primario data-[state=indeterminate]:bg-primario',
          'disabled:cursor-not-allowed disabled:opacity-60',
          anilloFoco,
        )}
      >
        <Checkbox.Indicator className="text-primario-texto">
          {marcada === 'indeterminada' ? (
            <Minus aria-hidden className="h-3.5 w-3.5" />
          ) : (
            <Check aria-hidden className="h-3.5 w-3.5" />
          )}
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        htmlFor={idCasilla}
        className={cn(
          'cursor-pointer text-md text-texto',
          etiquetaOculta && 'sr-only',
        )}
      >
        {etiqueta}
      </label>
    </div>
  );
}
