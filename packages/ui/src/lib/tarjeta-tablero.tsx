'use client';

import { useId, type HTMLAttributes } from 'react';
import { CalendarClock } from 'lucide-react';
import { es } from '../i18n';
import { Avatar } from './avatar';
import { ChipEstado, type EstadoChip } from './chip-estado';
import { anilloFoco, cn } from './utilidades';

export interface DestinoMover {
  valor: string;
  etiqueta: string;
}

export interface TarjetaTableroProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  titulo: string;
  estado: EstadoChip;
  responsable?: string;
  plazo?: string;
  /** Alternativa por teclado al arrastre: mover la tarjeta a otra columna. */
  destinos?: readonly DestinoMover[];
  onMover?: (destino: string) => void;
  onAbrir?: () => void;
}

export function TarjetaTablero({
  titulo,
  estado,
  responsable,
  plazo,
  destinos,
  onMover,
  onAbrir,
  className,
  ...resto
}: TarjetaTableroProps) {
  const idMover = useId();
  return (
    <article
      className={cn(
        'flex flex-col gap-espacio-2 rounded-md border border-borde-suave bg-superficie p-espacio-3 shadow-sm',
        className,
      )}
      {...resto}
    >
      <button
        type="button"
        onClick={onAbrir}
        className={cn(
          'rounded-sm text-left text-md font-medium text-texto',
          anilloFoco,
        )}
      >
        {titulo}
      </button>
      <div className="flex items-center justify-between gap-espacio-2">
        <ChipEstado estado={estado} />
        {responsable ? <Avatar nombre={responsable} tamano={24} /> : null}
      </div>
      {plazo ? (
        <p className="flex items-center gap-espacio-1 text-xs text-texto-secundario">
          <CalendarClock aria-hidden className="h-3.5 w-3.5" />
          {plazo}
        </p>
      ) : null}
      {destinos && onMover ? (
        <div>
          <label htmlFor={idMover} className="sr-only">
            {es.comunes.moverA}
          </label>
          <select
            id={idMover}
            defaultValue=""
            onChange={(e) => e.target.value && onMover(e.target.value)}
            className={cn(
              'min-h-fila-web w-full rounded-sm border border-borde-campo bg-superficie px-espacio-2 text-xs text-texto',
              anilloFoco,
            )}
          >
            <option value="">{es.comunes.moverA}…</option>
            {destinos.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.etiqueta}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </article>
  );
}
