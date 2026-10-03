'use client';

import type { ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { es } from '../i18n';
import { anilloFoco, cn } from './utilidades';

export interface VentanaProps {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  pie?: ReactNode;
}

const botonCerrar = (
  <Dialog.Close
    aria-label={es.comunes.cerrar}
    className={cn(
      'absolute right-espacio-3 top-espacio-3 rounded-sm p-espacio-1 text-texto-secundario hover:text-texto',
      anilloFoco,
    )}
  >
    <X aria-hidden className="h-5 w-5" />
  </Dialog.Close>
);

/** Ventana modal: atrapa el foco, cierra con Esc y devuelve el foco al disparador. */
export function Modal({
  abierto,
  onCambio,
  titulo,
  descripcion,
  children,
  pie,
}: VentanaProps) {
  return (
    <Dialog.Root open={abierto} onOpenChange={onCambio}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-velo" />
        <Dialog.Content
          {...(descripcion ? {} : { 'aria-describedby': undefined })}
          className="fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-superficie p-espacio-5 text-texto shadow-lg"
        >
          <Dialog.Title className="pr-espacio-6 text-xl font-semibold">
            {titulo}
          </Dialog.Title>
          {descripcion ? (
            <Dialog.Description className="mt-espacio-1 text-md text-texto-secundario">
              {descripcion}
            </Dialog.Description>
          ) : null}
          <div className="mt-espacio-4">{children}</div>
          {pie ? (
            <div className="mt-espacio-5 flex justify-end gap-espacio-2">
              {pie}
            </div>
          ) : null}
          {botonCerrar}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Panel de detalle a la derecha: no bloquea la lista y cierra con Esc. */
export function PanelLateral({
  abierto,
  onCambio,
  titulo,
  descripcion,
  children,
  pie,
}: VentanaProps) {
  return (
    <Dialog.Root open={abierto} onOpenChange={onCambio} modal={false}>
      <Dialog.Portal>
        <Dialog.Content
          {...(descripcion ? {} : { 'aria-describedby': undefined })}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed right-0 top-0 z-40 flex h-full w-[min(26rem,100vw)] flex-col border-l border-borde-suave bg-superficie p-espacio-5 text-texto shadow-lg"
        >
          <Dialog.Title className="pr-espacio-6 text-xl font-semibold">
            {titulo}
          </Dialog.Title>
          {descripcion ? (
            <Dialog.Description className="mt-espacio-1 text-md text-texto-secundario">
              {descripcion}
            </Dialog.Description>
          ) : null}
          <div className="mt-espacio-4 flex-1 overflow-auto">{children}</div>
          {pie ? (
            <div className="mt-espacio-4 flex justify-end gap-espacio-2">
              {pie}
            </div>
          ) : null}
          {botonCerrar}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
