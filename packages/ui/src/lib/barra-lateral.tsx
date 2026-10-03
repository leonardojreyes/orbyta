'use client';

import type { ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { es } from '../i18n';
import { Insignia } from './insignia';
import { anilloFoco, cn } from './utilidades';

export interface ItemNavegacion {
  id: string;
  etiqueta: string;
  icono?: LucideIcon;
  href?: string;
  activo?: boolean;
  contador?: number;
  hijos?: readonly ItemNavegacion[];
}

export interface BarraLateralProps {
  /** Logo de la empresa (ver `LogoEmpresa`). */
  logo: ReactNode;
  items: readonly ItemNavegacion[];
  colapsada: boolean;
  onAlternar: () => void;
  onNavegar?: (item: ItemNavegacion) => void;
}

function Enlace({
  item,
  colapsada,
  nivel,
  onNavegar,
}: {
  item: ItemNavegacion;
  colapsada: boolean;
  nivel: number;
  onNavegar?: (i: ItemNavegacion) => void;
}) {
  const Icono = item.icono;
  return (
    <li>
      <a
        href={item.href ?? '#'}
        aria-current={item.activo ? 'page' : undefined}
        aria-label={colapsada ? item.etiqueta : undefined}
        title={colapsada ? item.etiqueta : undefined}
        onClick={(e) => {
          if (onNavegar) {
            e.preventDefault();
            onNavegar(item);
          }
        }}
        style={{
          paddingLeft: colapsada
            ? undefined
            : `calc(var(--espacio-3) * ${nivel + 1})`,
        }}
        className={cn(
          'flex min-h-fila-web items-center gap-espacio-2 rounded-sm pr-espacio-3 text-md',
          colapsada ? 'justify-center px-espacio-2' : '',
          item.activo
            ? 'bg-chip-curso-fondo font-medium text-chip-curso-texto'
            : 'text-texto hover:bg-fondo',
          anilloFoco,
        )}
      >
        {Icono ? <Icono aria-hidden className="h-4 w-4 shrink-0" /> : null}
        {colapsada ? null : (
          <span className="flex-1 truncate">{item.etiqueta}</span>
        )}
        {!colapsada && item.contador !== undefined ? (
          <Insignia>{item.contador}</Insignia>
        ) : null}
        {!colapsada && item.hijos ? (
          <ChevronDown aria-hidden className="h-4 w-4 text-texto-secundario" />
        ) : null}
      </a>
      {!colapsada && item.hijos ? (
        <ul className="mt-espacio-1 flex flex-col gap-espacio-1">
          {item.hijos.map((h) => (
            <Enlace
              key={h.id}
              item={h}
              colapsada={colapsada}
              nivel={nivel + 1}
              onNavegar={onNavegar}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Barra lateral con jerarquía empresa → proyectos → vistas. Se contrae a iconos con etiqueta accesible. */
export function BarraLateral({
  logo,
  items,
  colapsada,
  onAlternar,
  onNavegar,
}: BarraLateralProps) {
  return (
    <nav
      aria-label={es.navegacion.principal}
      className={cn(
        'flex h-full flex-col gap-espacio-3 border-r border-borde-suave bg-superficie p-espacio-3',
        colapsada ? 'w-16' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex min-h-10 items-center',
          colapsada ? 'justify-center' : 'justify-between',
        )}
      >
        {colapsada ? null : logo}
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={!colapsada}
          aria-label={
            colapsada ? es.navegacion.expandir : es.navegacion.colapsar
          }
          className={cn(
            'rounded-sm p-espacio-2 text-texto-secundario hover:text-texto',
            anilloFoco,
          )}
        >
          {colapsada ? (
            <ChevronRight aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronLeft aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      <ul className="flex flex-col gap-espacio-1">
        {items.map((item) => (
          <Enlace
            key={item.id}
            item={item}
            colapsada={colapsada}
            nivel={0}
            onNavegar={onNavegar}
          />
        ))}
      </ul>
    </nav>
  );
}
