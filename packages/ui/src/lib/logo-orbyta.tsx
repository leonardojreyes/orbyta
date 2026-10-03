import { es } from '../i18n';
import { cn } from './utilidades';

export interface LogoOrbytaProps {
  /** Ruta pública del logo. Por defecto `/marca/orbyta-logo.svg` (fuente: `docs/design/marca/`). */
  src?: string;
  className?: string;
}

/** Logo de Orbyta: fijo para todas las empresas (el logo de cada empresa es `LogoEmpresa`). */
export function LogoOrbyta({
  src = '/marca/orbyta-logo.svg',
  className,
}: LogoOrbytaProps) {
  return (
    <img
      src={src}
      alt={es.marca.logoOrbyta}
      width={160}
      height={122}
      className={cn('overflow-hidden rounded-md', className)}
    />
  );
}
