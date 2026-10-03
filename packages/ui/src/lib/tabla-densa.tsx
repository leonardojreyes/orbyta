'use client';

import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { es } from '../i18n';
import { Casilla } from './casilla';
import { anilloFoco, cn } from './utilidades';

export interface Columna<T> {
  id: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  /** Valor con el que se ordena; si falta, la columna no es ordenable. */
  valorOrden?: (fila: T) => string | number;
}

export interface TablaDensaProps<T> {
  /** Describe la tabla a lectores de pantalla. */
  descripcion: string;
  columnas: readonly Columna<T>[];
  filas: readonly T[];
  idFila: (fila: T) => string;
  seleccionadas?: ReadonlySet<string>;
  onSeleccion?: (ids: Set<string>) => void;
  onAbrir?: (fila: T) => void;
  className?: string;
}

type Orden = { columna: string; direccion: 'asc' | 'desc' } | null;

/** Tabla de alta densidad: cabecera fija, orden por columna, selección múltiple y navegación con flechas. */
export function TablaDensa<T>({
  descripcion,
  columnas,
  filas,
  idFila,
  seleccionadas,
  onSeleccion,
  onAbrir,
  className,
}: TablaDensaProps<T>) {
  const [orden, setOrden] = useState<Orden>(null);
  const [activa, setActiva] = useState(0);

  const ordenadas = useMemo(() => {
    const col = columnas.find((c) => c.id === orden?.columna);
    if (!orden || !col?.valorOrden) return filas;
    const valor = col.valorOrden;
    const signo = orden.direccion === 'asc' ? 1 : -1;
    return [...filas].sort((a, b) =>
      valor(a) > valor(b) ? signo : valor(a) < valor(b) ? -signo : 0,
    );
  }, [filas, columnas, orden]);

  const alternarOrden = (id: string) =>
    setOrden((o) =>
      o?.columna === id
        ? o.direccion === 'asc'
          ? { columna: id, direccion: 'desc' }
          : null
        : { columna: id, direccion: 'asc' },
    );

  const todas = seleccionadas
    ? ordenadas.length > 0 &&
      ordenadas.every((f) => seleccionadas.has(idFila(f)))
    : false;
  const algunas = seleccionadas
    ? ordenadas.some((f) => seleccionadas.has(idFila(f)))
    : false;

  const alPulsar = (
    e: KeyboardEvent<HTMLTableRowElement>,
    indice: number,
    fila: T,
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const siguiente = Math.min(
        ordenadas.length - 1,
        Math.max(0, indice + (e.key === 'ArrowDown' ? 1 : -1)),
      );
      setActiva(siguiente);
      const filasDom = e.currentTarget.parentElement?.querySelectorAll('tr');
      (filasDom?.[siguiente] as HTMLElement | undefined)?.focus();
    } else if (e.key === 'Enter' && onAbrir && e.target === e.currentTarget) {
      onAbrir(fila);
    }
  };

  return (
    <div
      className={cn(
        'overflow-auto rounded-md border border-borde-suave bg-superficie',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm text-texto">
        <caption className="sr-only">{descripcion}</caption>
        <thead>
          <tr>
            {onSeleccion ? (
              <th
                scope="col"
                className="sticky top-0 z-10 w-10 border-b border-borde-suave bg-superficie px-espacio-2"
              >
                <Casilla
                  etiqueta={es.comunes.seleccionarTodo}
                  etiquetaOculta
                  marcada={todas ? true : algunas ? 'indeterminada' : false}
                  onCambio={(v) =>
                    onSeleccion(v ? new Set(ordenadas.map(idFila)) : new Set())
                  }
                />
              </th>
            ) : null}
            {columnas.map((c) => {
              const ordenable = Boolean(c.valorOrden);
              const dir = orden?.columna === c.id ? orden.direccion : null;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={
                    dir === 'asc'
                      ? 'ascending'
                      : dir === 'desc'
                        ? 'descending'
                        : ordenable
                          ? 'none'
                          : undefined
                  }
                  className="sticky top-0 z-10 border-b border-borde-suave bg-superficie px-espacio-3 text-left font-semibold"
                >
                  {ordenable ? (
                    <button
                      type="button"
                      onClick={() => alternarOrden(c.id)}
                      className={cn(
                        'inline-flex min-h-fila-web items-center gap-espacio-1',
                        anilloFoco,
                      )}
                    >
                      {c.encabezado}
                      {dir === 'asc' ? (
                        <ArrowUp aria-hidden className="h-3.5 w-3.5" />
                      ) : dir === 'desc' ? (
                        <ArrowDown aria-hidden className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown
                          aria-hidden
                          className="h-3.5 w-3.5 text-texto-secundario"
                        />
                      )}
                      <span className="sr-only">{es.comunes.ordenarPor}</span>
                    </button>
                  ) : (
                    <span className="inline-flex min-h-fila-web items-center">
                      {c.encabezado}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((fila, i) => {
            const id = idFila(fila);
            const marcada = seleccionadas?.has(id) ?? false;
            return (
              <tr
                key={id}
                tabIndex={i === activa ? 0 : -1}
                aria-selected={onSeleccion ? marcada : undefined}
                onKeyDown={(e) => alPulsar(e, i, fila)}
                onFocus={() => setActiva(i)}
                onDoubleClick={() => onAbrir?.(fila)}
                className={cn(
                  'h-fila-web border-b border-borde-suave tabular-nums hover:bg-fondo',
                  marcada && 'bg-chip-curso-fondo',
                  anilloFoco,
                )}
              >
                {onSeleccion ? (
                  <td className="w-10 px-espacio-2">
                    <Casilla
                      etiqueta={es.comunes.seleccionarFila}
                      etiquetaOculta
                      marcada={marcada}
                      onCambio={(v) => {
                        const nuevo = new Set(seleccionadas);
                        if (v) nuevo.add(id);
                        else nuevo.delete(id);
                        onSeleccion(nuevo);
                      }}
                    />
                  </td>
                ) : null}
                {columnas.map((c) => (
                  <td key={c.id} className="px-espacio-3">
                    {c.celda(fila)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
