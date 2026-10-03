'use client';

import { useEffect, type ReactNode } from 'react';
import { Command } from 'cmdk';
import { es } from '../i18n';

export interface ComandoPaleta {
  id: string;
  etiqueta: string;
  grupo: string;
  icono?: ReactNode;
  atajo?: string;
  ejecutar: () => void;
}

/** Abre la paleta con Ctrl+K (Windows/Linux) o Cmd+K (macOS). */
export function useAtajoPaleta(alAbrir: () => void) {
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        alAbrir();
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [alAbrir]);
}

export interface PaletaComandosProps {
  abierta: boolean;
  onCambio: (abierta: boolean) => void;
  comandos: readonly ComandoPaleta[];
}

/** Paleta de comandos: busca órdenes, proyectos y acciones; todo con teclado. */
export function PaletaComandos({
  abierta,
  onCambio,
  comandos,
}: PaletaComandosProps) {
  const grupos = [...new Set(comandos.map((c) => c.grupo))];
  return (
    <Command.Dialog
      open={abierta}
      onOpenChange={onCambio}
      label={es.navegacion.paletaTitulo}
      overlayClassName="fixed inset-0 z-40 bg-velo"
      contentClassName="fixed left-1/2 top-24 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg bg-superficie text-texto shadow-lg"
    >
      <Command.Input
        placeholder={es.navegacion.paletaPlaceholder}
        className="min-h-tactil-movil w-full border-b border-borde-suave bg-transparent px-espacio-4 text-lg text-texto placeholder:text-texto-secundario"
      />
      <Command.List className="max-h-80 overflow-auto p-espacio-2">
        <Command.Empty className="p-espacio-4 text-md text-texto-secundario">
          {es.comunes.sinResultados}
        </Command.Empty>
        {grupos.map((grupo) => (
          <Command.Group
            key={grupo}
            heading={grupo}
            className="text-xs font-medium text-texto-secundario [&_[cmdk-group-heading]]:px-espacio-3 [&_[cmdk-group-heading]]:py-espacio-1"
          >
            {comandos
              .filter((c) => c.grupo === grupo)
              .map((c) => (
                <Command.Item
                  key={c.id}
                  value={`${c.grupo} ${c.etiqueta}`}
                  onSelect={() => {
                    c.ejecutar();
                    onCambio(false);
                  }}
                  className="flex min-h-fila-web cursor-pointer items-center gap-espacio-2 rounded-sm px-espacio-3 text-md text-texto data-[selected=true]:bg-fondo"
                >
                  {c.icono}
                  <span className="flex-1">{c.etiqueta}</span>
                  {c.atajo ? (
                    <kbd className="text-xs text-texto-secundario">
                      {c.atajo}
                    </kbd>
                  ) : null}
                </Command.Item>
              ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
