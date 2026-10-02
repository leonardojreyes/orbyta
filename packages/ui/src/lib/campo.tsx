'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { es } from '../i18n';
import { anilloFoco, cn } from './utilidades';

export interface EtiquetaCampoProps {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
}

/** Estructura común de etiqueta, ayuda y error para los controles de formulario. */
export function GrupoCampo({
  id,
  etiqueta,
  ayuda,
  error,
  opcional,
  children,
}: EtiquetaCampoProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-espacio-1">
      <label htmlFor={id} className="text-sm font-medium text-texto">
        {etiqueta}
        {opcional ? (
          <span className="font-normal text-texto-secundario">
            {' '}
            ({es.comunes.opcional})
          </span>
        ) : null}
      </label>
      {children}
      {ayuda ? (
        <p id={`${id}-ayuda`} className="text-xs text-texto-secundario">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const clasesControl = (invalido: boolean) =>
  cn(
    'min-h-fila-web w-full rounded-sm border bg-superficie px-espacio-3 text-md text-texto',
    'placeholder:text-texto-secundario disabled:cursor-not-allowed disabled:opacity-60',
    invalido ? 'border-error' : 'border-borde-campo',
    anilloFoco,
  );

export const describedBy = (id: string, ayuda?: string, error?: string) =>
  [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined;

export interface CampoProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>,
    EtiquetaCampoProps {
  id?: string;
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { id, etiqueta, ayuda, error, opcional, className, required, ...resto },
  ref,
) {
  const generado = useId();
  const idCampo = id ?? generado;
  return (
    <GrupoCampo
      id={idCampo}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      opcional={opcional}
    >
      <input
        ref={ref}
        id={idCampo}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(idCampo, ayuda, error)}
        className={cn(clasesControl(Boolean(error)), className)}
        {...resto}
      />
    </GrupoCampo>
  );
});

/** Campo de fecha. El navegador muestra el formato local (dd/mm/aaaa en es-EC) y un calendario. */
export const CampoFecha = forwardRef<
  HTMLInputElement,
  Omit<CampoProps, 'type'>
>(function CampoFecha(props, ref) {
  return <Campo ref={ref} type="date" {...props} />;
});
