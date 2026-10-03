'use client';

import type { ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react';
import { es } from '../i18n';
import { anilloFoco, cn } from './utilidades';

export type TipoAviso = 'exito' | 'info' | 'advertencia' | 'error';

const config: Record<
  TipoAviso,
  { clases: string; Icono: LucideIcon; rol: 'status' | 'alert' }
> = {
  exito: {
    clases: 'bg-chip-cerrada-fondo text-chip-cerrada-texto',
    Icono: CheckCircle2,
    rol: 'status',
  },
  info: {
    clases: 'bg-chip-curso-fondo text-chip-curso-texto',
    Icono: Info,
    rol: 'status',
  },
  advertencia: {
    clases: 'bg-chip-riesgo-fondo text-chip-riesgo-texto',
    Icono: AlertTriangle,
    rol: 'alert',
  },
  error: {
    clases: 'bg-chip-vencida-fondo text-chip-vencida-texto',
    Icono: AlertCircle,
    rol: 'alert',
  },
};

export interface AvisoProps {
  tipo: TipoAviso;
  titulo?: string;
  children: ReactNode;
  onCerrar?: () => void;
  className?: string;
}

/** Mensajes anunciados a lectores de pantalla (`status` o `alert`). No se descartan solos. */
export function Aviso({
  tipo,
  titulo,
  children,
  onCerrar,
  className,
}: AvisoProps) {
  const { clases, Icono, rol } = config[tipo];
  return (
    <div
      role={rol}
      className={cn(
        'flex items-start gap-espacio-3 rounded-md p-espacio-3 text-md',
        clases,
        className,
      )}
    >
      <Icono aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        {titulo ? <p className="font-semibold">{titulo}</p> : null}
        <div>{children}</div>
      </div>
      {onCerrar ? (
        <button
          type="button"
          onClick={onCerrar}
          aria-label={es.comunes.cerrar}
          className={cn('rounded-sm p-espacio-1', anilloFoco)}
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
