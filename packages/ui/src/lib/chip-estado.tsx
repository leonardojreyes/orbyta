'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { es } from '../i18n';
import { cn } from './utilidades';

export type EstadoChip =
  'registrada' | 'en_curso' | 'cerrada' | 'en_riesgo' | 'vencida';

const config: Record<EstadoChip, { clases: string; Icono: LucideIcon }> = {
  registrada: {
    clases: 'bg-chip-neutro-fondo text-chip-neutro-texto',
    Icono: Circle,
  },
  en_curso: {
    clases: 'bg-chip-curso-fondo text-chip-curso-texto',
    Icono: Clock,
  },
  cerrada: {
    clases: 'bg-chip-cerrada-fondo text-chip-cerrada-texto',
    Icono: CheckCircle2,
  },
  en_riesgo: {
    clases: 'bg-chip-riesgo-fondo text-chip-riesgo-texto',
    Icono: AlertTriangle,
  },
  vencida: {
    clases: 'bg-chip-vencida-fondo text-chip-vencida-texto',
    Icono: AlertCircle,
  },
};

export interface ChipEstadoProps {
  estado: EstadoChip;
  className?: string;
}

/** Estado siempre con color, icono y texto: el color nunca es la única señal. */
export function ChipEstado({ estado, className }: ChipEstadoProps) {
  const { clases, Icono } = config[estado];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-espacio-1 rounded-sm px-espacio-2 py-0.5 text-xs font-medium',
        clases,
        className,
      )}
    >
      <Icono aria-hidden className="h-3.5 w-3.5" />
      {es.estados[estado]}
    </span>
  );
}
