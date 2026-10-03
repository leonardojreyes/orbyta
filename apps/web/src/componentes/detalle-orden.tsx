import { ChipEstado } from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';
import {
  estadoVisible,
  formatearFecha,
  type OrdenEjemplo,
} from '@orbyta/ui/ejemplos';

/** Contenido del detalle de una OS; se usa en el panel lateral y en la página completa. */
export function DetalleOrden({ orden }: { orden: OrdenEjemplo }) {
  const datos: [string, string][] = [
    [es.detalle.abonado, orden.abonado],
    [es.detalle.puntoServicio, orden.puntoServicio],
    [es.ordenes.columnas.tipoFalla, orden.tipoFalla],
    [es.detalle.tecnico, orden.responsable ?? es.ordenes.sinResponsable],
    [es.ordenes.columnas.plazo, formatearFecha(orden.vence)],
  ];
  return (
    <div className="flex flex-col gap-espacio-4">
      <div className="flex items-center gap-espacio-2">
        <ChipEstado estado={estadoVisible(orden)} />
      </div>
      <p className="text-md">{orden.descripcion}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-espacio-4 gap-y-espacio-2 text-sm">
        {datos.map(([clave, valor]) => (
          <div key={clave} className="contents">
            <dt className="text-texto-secundario">{clave}</dt>
            <dd className="font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby={`historial-${orden.id}`}>
        <h3
          id={`historial-${orden.id}`}
          className="mb-espacio-2 text-lg font-semibold"
        >
          {es.detalle.historial}
        </h3>
        <ol className="flex flex-col gap-espacio-2 border-l-2 border-borde-suave pl-espacio-3">
          {orden.historial.map((h) => (
            <li key={h.cuando + h.texto} className="text-sm">
              <span className="block text-xs text-texto-secundario tabular-nums">
                {h.cuando}
              </span>
              {h.texto}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
