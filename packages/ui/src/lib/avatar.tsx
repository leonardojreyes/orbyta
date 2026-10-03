'use client';

import { Avatar as AvatarRadix } from 'radix-ui';
import { cn } from './utilidades';

const tamanos = {
  24: 'h-6 w-6 text-xs',
  32: 'h-8 w-8 text-sm',
  40: 'h-10 w-10 text-md',
} as const;

export interface AvatarProps {
  nombre: string;
  imagen?: string;
  tamano?: keyof typeof tamanos;
  className?: string;
}

export const iniciales = (nombre: string): string =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export function Avatar({
  nombre,
  imagen,
  tamano = 32,
  className,
}: AvatarProps) {
  return (
    <AvatarRadix.Root
      role="img"
      aria-label={nombre}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-chip-curso-fondo font-medium text-chip-curso-texto',
        tamanos[tamano],
        className,
      )}
    >
      {imagen ? (
        <AvatarRadix.Image
          src={imagen}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : null}
      <AvatarRadix.Fallback aria-hidden>
        {iniciales(nombre)}
      </AvatarRadix.Fallback>
    </AvatarRadix.Root>
  );
}
