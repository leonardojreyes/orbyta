'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import {
  Avatar,
  Boton,
  ChipEstado,
  PanelLateral,
  TablaDensa,
  TarjetaTablero,
  anilloFoco,
  cn,
  type Columna,
} from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';
import {
  columnasTablero,
  estadoVisible,
  formatearFecha,
  ordenesEjemplo,
  type EstadoOrden,
  type OrdenEjemplo,
} from '@orbyta/ui/ejemplos';
import { DetalleOrden } from './detalle-orden';

type Vista = 'lista' | 'tablero';

const columnas: Columna<OrdenEjemplo>[] = [
  {
    id: 'numero',
    encabezado: es.ordenes.columnas.numero,
    celda: (o) => o.numero,
    valorOrden: (o) => o.numero,
  },
  {
    id: 'descripcion',
    encabezado: es.ordenes.columnas.descripcion,
    celda: (o) => o.descripcion,
  },
  {
    id: 'tipoFalla',
    encabezado: es.ordenes.columnas.tipoFalla,
    celda: (o) => o.tipoFalla,
    valorOrden: (o) => o.tipoFalla,
  },
  {
    id: 'estado',
    encabezado: es.ordenes.columnas.estado,
    celda: (o) => <ChipEstado estado={estadoVisible(o)} />,
    valorOrden: (o) => estadoVisible(o),
  },
  {
    id: 'plazo',
    encabezado: es.ordenes.columnas.plazo,
    celda: (o) => formatearFecha(o.vence),
    valorOrden: (o) => o.vence,
  },
  {
    id: 'responsable',
    encabezado: es.ordenes.columnas.responsable,
    celda: (o) =>
      o.responsable ? (
        <Avatar nombre={o.responsable} tamano={24} />
      ) : (
        <span className="text-texto-secundario">
          {es.ordenes.sinResponsable}
        </span>
      ),
  },
];

/** Listado de OS con vista de lista y de tablero; el detalle se abre en un panel lateral. */
export function VistaOrdenes() {
  const [vista, setVista] = useState<Vista>('lista');
  const [ordenes, setOrdenes] = useState<OrdenEjemplo[]>([...ordenesEjemplo]);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [abierta, setAbierta] = useState<OrdenEjemplo | null>(null);

  const mover = (id: string, estado: string) =>
    setOrdenes((lista) =>
      lista.map((o) =>
        o.id === id ? { ...o, estado: estado as EstadoOrden } : o,
      ),
    );

  const opciones: { id: Vista; etiqueta: string; Icono: typeof List }[] = [
    { id: 'lista', etiqueta: es.ordenes.vistaLista, Icono: List },
    { id: 'tablero', etiqueta: es.ordenes.vistaTablero, Icono: LayoutGrid },
  ];

  return (
    <div className="flex flex-col gap-espacio-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{es.ordenes.titulo}</h1>
        <div
          role="group"
          aria-label={es.ordenes.vistas}
          className="flex rounded-md border border-borde-campo bg-superficie p-0.5"
        >
          {opciones.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              aria-pressed={vista === id}
              onClick={() => setVista(id)}
              className={cn(
                'flex min-h-fila-web items-center gap-espacio-1 rounded-sm px-espacio-3 text-md',
                vista === id
                  ? 'bg-primario text-primario-texto'
                  : 'text-texto hover:bg-fondo',
                anilloFoco,
              )}
            >
              <Icono aria-hidden className="h-4 w-4" />
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {vista === 'lista' ? (
        <TablaDensa
          descripcion={es.ordenes.titulo}
          columnas={columnas}
          filas={ordenes}
          idFila={(o) => o.id}
          seleccionadas={seleccionadas}
          onSeleccion={setSeleccionadas}
          onAbrir={setAbierta}
        />
      ) : (
        <div className="grid gap-espacio-4 md:grid-cols-3">
          {columnasTablero.map(({ id }) => (
            <section
              key={id}
              aria-label={es.estados[id]}
              className="flex flex-col gap-espacio-3 rounded-md bg-fondo p-espacio-3"
            >
              <h2 className="text-lg font-semibold">
                {es.estados[id]}{' '}
                <span className="text-sm font-normal text-texto-secundario">
                  ({ordenes.filter((o) => o.estado === id).length})
                </span>
              </h2>
              {ordenes
                .filter((o) => o.estado === id)
                .map((o) => (
                  <TarjetaTablero
                    key={o.id}
                    titulo={`${o.numero} · ${o.descripcion}`}
                    estado={estadoVisible(o)}
                    responsable={o.responsable}
                    plazo={formatearFecha(o.vence)}
                    destinos={columnasTablero
                      .filter((c) => c.id !== id)
                      .map((c) => ({
                        valor: c.id,
                        etiqueta: es.estados[c.id],
                      }))}
                    onMover={(destino) => mover(o.id, destino)}
                    onAbrir={() => setAbierta(o)}
                  />
                ))}
            </section>
          ))}
        </div>
      )}

      <PanelLateral
        abierto={abierta !== null}
        onCambio={(v) => !v && setAbierta(null)}
        titulo={abierta ? `${abierta.numero}` : es.detalle.titulo}
        descripcion={es.detalle.titulo}
        pie={
          <Boton variante="secundario" onClick={() => setAbierta(null)}>
            {es.comunes.cerrar}
          </Boton>
        }
      >
        {abierta ? <DetalleOrden orden={abierta} /> : null}
      </PanelLateral>
    </div>
  );
}
