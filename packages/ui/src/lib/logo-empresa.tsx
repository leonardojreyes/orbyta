'use client';

import { es } from '../i18n';
import { cn } from './utilidades';

export interface LogoEmpresaProps {
  nombre: string;
  /** URL del logotipo de la empresa (SVG o PNG con fondo transparente). Si falta, se muestra el nombre. */
  src?: string;
  className?: string;
}

/** Espacio para el logo de la empresa: máximo 160 × 40 px. Es lo único que cambia entre empresas. */
export function LogoEmpresa({ nombre, src, className }: LogoEmpresaProps) {
  return src ? (
    <img
      src={src}
      alt={`${es.marca.logoEmpresa}: ${nombre}`}
      className={cn('max-h-10 max-w-40 object-contain', className)}
    />
  ) : (
    <span
      className={cn(
        'max-w-40 truncate text-lg font-semibold text-texto',
        className,
      )}
    >
      {nombre}
    </span>
  );
}
