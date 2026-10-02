import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind resolviendo conflictos. */
export const cn = (...entradas: ClassValue[]): string =>
  twMerge(clsx(entradas));

/** Clases del anillo de foco visible, común a todos los controles. */
export const anilloFoco =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foco focus-visible:ring-offset-2 focus-visible:ring-offset-foco-halo';
