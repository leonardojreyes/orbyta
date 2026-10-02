import { AlertCircle, AlertTriangle, ClipboardList } from 'lucide-react';
import { ChipEstado } from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';
import { ordenesEjemplo, resumenEjemplo } from '@orbyta/ui/ejemplos';

/** Resumen de órdenes por estado y por plazo. Datos de ejemplo hasta el paso 0.6. */
export function PanelResumen() {
  const r = resumenEjemplo(ordenesEjemplo);
  const tarjetas = [
    {
      clave: 'total',
      titulo: es.panel.total,
      valor: r.total,
      Icono: ClipboardList,
    },
    {
      clave: 'riesgo',
      titulo: es.panel.enRiesgo,
      valor: r.enRiesgo,
      Icono: AlertTriangle,
    },
    {
      clave: 'vencidas',
      titulo: es.panel.vencidas,
      valor: r.vencidas,
      Icono: AlertCircle,
    },
  ];
  return (
    <div className="flex flex-col gap-espacio-5">
      <div>
        <h1 className="text-2xl font-semibold">{es.panel.titulo}</h1>
        <p className="text-md text-texto-secundario">{es.panel.resumen}</p>
      </div>
      <ul
        className="grid gap-espacio-4 sm:grid-cols-3"
        aria-label={es.panel.resumen}
      >
        {tarjetas.map(({ clave, titulo, valor, Icono }) => (
          <li
            key={clave}
            className="flex items-center gap-espacio-3 rounded-md border border-borde-suave bg-superficie p-espacio-4 shadow-sm"
          >
            <Icono aria-hidden className="h-8 w-8 text-acento" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{valor}</p>
              <p className="text-sm text-texto-secundario">{titulo}</p>
            </div>
          </li>
        ))}
      </ul>
      <section
        aria-labelledby="por-estado"
        className="rounded-md border border-borde-suave bg-superficie p-espacio-4"
      >
        <h2 id="por-estado" className="mb-espacio-3 text-xl font-semibold">
          {es.panel.porEstado}
        </h2>
        <ul className="flex flex-col gap-espacio-3">
          {(['registrada', 'en_curso', 'cerrada'] as const).map((estado) => {
            const cantidad = r[estado];
            return (
              <li key={estado} className="flex items-center gap-espacio-3">
                <span className="w-32">
                  <ChipEstado estado={estado} />
                </span>
                <div
                  className="h-2 flex-1 rounded-full bg-borde-suave"
                  role="presentation"
                >
                  <div
                    className="h-2 rounded-full bg-exito-relleno"
                    style={{ width: `${(cantidad / r.total) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right tabular-nums">{cantidad}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
