'use client';

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import { Command } from 'cmdk';
import { Popover } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';
import { es } from '../i18n';
import {
  GrupoCampo,
  clasesControl,
  describedBy,
  type EtiquetaCampoProps,
} from './campo';
import { anilloFoco, cn } from './utilidades';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
}

/** A partir de este número de opciones el selector ofrece búsqueda. */
export const UMBRAL_BUSQUEDA = 7;

export interface SelectorProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'onChange' | 'value'>,
    EtiquetaCampoProps {
  id?: string;
  opciones: readonly OpcionSelector[];
  valor: string;
  onCambio: (valor: string) => void;
}

/** Selector accesible: lista nativa hasta 7 opciones; con más, combinación con búsqueda. */
export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(
  function Selector(
    {
      id,
      etiqueta,
      ayuda,
      error,
      opcional,
      opciones,
      valor,
      onCambio,
      className,
      ...resto
    },
    ref,
  ) {
    const generado = useId();
    const idCampo = id ?? generado;
    if (opciones.length > UMBRAL_BUSQUEDA) {
      return (
        <SelectorBuscable
          id={idCampo}
          etiqueta={etiqueta}
          ayuda={ayuda}
          error={error}
          opcional={opcional}
          opciones={opciones}
          valor={valor}
          onCambio={onCambio}
        />
      );
    }
    return (
      <GrupoCampo
        id={idCampo}
        etiqueta={etiqueta}
        ayuda={ayuda}
        error={error}
        opcional={opcional}
      >
        <select
          ref={ref}
          id={idCampo}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(idCampo, ayuda, error)}
          className={cn(clasesControl(Boolean(error)), className)}
          {...resto}
        >
          <option value="">{es.comunes.seleccionar}</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </GrupoCampo>
    );
  },
);

function SelectorBuscable({
  id,
  etiqueta,
  ayuda,
  error,
  opcional,
  opciones,
  valor,
  onCambio,
}: Pick<
  SelectorProps,
  | 'etiqueta'
  | 'ayuda'
  | 'error'
  | 'opcional'
  | 'opciones'
  | 'valor'
  | 'onCambio'
> & {
  id: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const actual = useMemo(
    () => opciones.find((o) => o.valor === valor),
    [opciones, valor],
  );
  return (
    <GrupoCampo
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      opcional={opcional}
    >
      <Popover.Root open={abierto} onOpenChange={setAbierto}>
        <Popover.Trigger
          id={id}
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-lista`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          className={cn(
            clasesControl(Boolean(error)),
            'flex items-center justify-between text-left',
          )}
        >
          <span className={actual ? '' : 'text-texto-secundario'}>
            {actual?.etiqueta ?? es.comunes.seleccionar}
          </span>
          <ChevronDown aria-hidden className="h-4 w-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(
              'z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-borde-suave bg-superficie shadow-md',
              anilloFoco,
            )}
          >
            <Command label={etiqueta}>
              <Command.Input
                placeholder={es.comunes.buscar}
                className="min-h-fila-web w-full border-b border-borde-suave bg-transparent px-espacio-3 text-md text-texto"
              />
              <Command.List
                id={`${id}-lista`}
                className="max-h-60 overflow-auto p-espacio-1"
              >
                <Command.Empty className="p-espacio-3 text-sm text-texto-secundario">
                  {es.comunes.sinResultados}
                </Command.Empty>
                {opciones.map((o) => (
                  <Command.Item
                    key={o.valor}
                    value={o.etiqueta}
                    onSelect={() => {
                      onCambio(o.valor);
                      setAbierto(false);
                    }}
                    className="flex min-h-fila-web cursor-pointer items-center justify-between rounded-sm px-espacio-3 text-md text-texto data-[selected=true]:bg-fondo"
                  >
                    {o.etiqueta}
                    {o.valor === valor ? (
                      <Check aria-hidden className="h-4 w-4" />
                    ) : null}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </GrupoCampo>
  );
}
