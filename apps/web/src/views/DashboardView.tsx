import { useEffect, useRef, useState } from "react";
import { DASHBOARD_PERIODS, LABELS, ORDER_PRIORITY, ORDER_STATUS, type DashboardData } from "@orbyta/shared";
import { api } from "../api";
import { BarList, BarTable, CHART, ChartCard, LineChart, LineTable, StatTile, fmtDuration, fmtInt, type BarRow } from "../charts";

/** Indicadores de la empresa (admin y supervisor). Un solo filtro de periodo arriba gobierna todo lo de abajo. */
export function DashboardView() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const seq = useRef(0); // descarta respuestas viejas si se cambia de periodo mientras otra consulta sigue en curso

  useEffect(() => {
    const mine = ++seq.current;
    setLoading(true);
    api<DashboardData>(`/dashboard?days=${days}`)
      .then((d) => { if (mine === seq.current) { setData(d); setErr(""); } })
      .catch((e) => { if (mine === seq.current) setErr((e as Error).message); })
      .finally(() => { if (mine === seq.current) setLoading(false); });
  }, [days]);

  if (!data) return <div className="p-6">{err ? <p className="text-sm text-rose-600">{err}</p> : <p className="text-sm text-slate-500">Cargando indicadores…</p>}</div>;

  const days_ = data.days; // los textos usan el periodo de los datos cargados, no el botón recién pulsado
  const open = data.byStatus.open + data.byStatus.assigned + data.byStatus.in_progress;
  const total = Object.values(data.byStatus).reduce((a, b) => a + b, 0);
  const created = data.daily.reduce((a, d) => a + d.created, 0);
  const closed = data.daily.reduce((a, d) => a + d.closed, 0);
  const r = data.resolution;

  // Estados: una sola serie → un solo color. Antigüedad y prioridad son categorías ordenadas → rampa ordinal.
  const byStatus: BarRow[] = ORDER_STATUS.map((s) => ({ key: s, label: LABELS[s]!, value: data.byStatus[s], color: CHART.series1 }));
  const aging: BarRow[] = [
    { key: "lt1d", label: "Menos de 1 día", value: data.aging.lt1d }, { key: "d1to3", label: "1 a 3 días", value: data.aging.d1to3 },
    { key: "d3to7", label: "3 a 7 días", value: data.aging.d3to7 }, { key: "gt7", label: "Más de 7 días", value: data.aging.gt7 },
  ].map((x, i) => ({ ...x, color: CHART.ordinal[i]! }));
  const priority: BarRow[] = ORDER_PRIORITY.map((p, i) => ({ key: p, label: LABELS[p]!, value: data.openByPriority[p], color: CHART.ordinal[i]! }));
  const dates = data.daily.map((d) => d.date);
  const series: [{ key: string; name: string; color: string; values: number[] }, { key: string; name: string; color: string; values: number[] }] = [
    { key: "created", name: "Creadas", color: CHART.series1, values: data.daily.map((d) => d.created) },
    { key: "closed", name: "Terminadas", color: CHART.series2, values: data.daily.map((d) => d.closed) },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">Indicadores</h1>

      {/* Un solo filtro, en una fila sobre todo lo que gobierna */}
      <div className="mb-5 flex items-center gap-2" role="group" aria-label="Periodo">
        {DASHBOARD_PERIODS.map((p) => (
          <button key={p} onClick={() => setDays(p)} aria-pressed={days === p}
            className={`rounded-lg border px-3 py-1.5 text-sm ${days === p ? "border-brand-500 bg-brand-50 font-medium text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            Últimos {p} días
          </button>
        ))}
        {err && <span className="ml-2 text-sm text-rose-600">{err}</span>}
      </div>

      {/* Mientras se recarga se conserva lo que ya se veía, atenuado (sin saltos de diseño) */}
      <div className={`space-y-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile hero label="Órdenes abiertas" value={fmtInt(open)} note={`de ${fmtInt(total)} en total`} />
          <StatTile label={`Creadas en ${days_} días`} value={fmtInt(created)} />
          <StatTile label={`Terminadas en ${days_} días`} value={fmtInt(closed)} />
          <StatTile label="Tiempo mediano de resolución"
            value={fmtDuration(r.medianHours)}
            note={r.sample ? `promedio ${fmtDuration(r.avgHours)} · 9 de cada 10 en ${fmtDuration(r.p90Hours)} o menos · ${fmtInt(r.sample)} órdenes` : "Sin órdenes terminadas con historial en el periodo"} />
        </div>

        <ChartCard title="Creadas y terminadas por día" subtitle={`Últimos ${days_} días`} table={<LineTable dates={dates} series={series} />}>
          {created + closed === 0 ? <p className="py-10 text-center text-sm text-slate-500">Sin movimiento de órdenes en el periodo.</p> : <LineChart dates={dates} series={series} />}
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Órdenes por estado" subtitle="Todas las órdenes de la empresa" table={<BarTable rows={byStatus} head="Estado" unit="Órdenes" />}>
            <BarList rows={byStatus} unit="órdenes" />
          </ChartCard>
          <ChartCard title="Abiertas por antigüedad" subtitle="Tiempo desde que se crearon" table={<BarTable rows={aging} head="Antigüedad" unit="Órdenes" />}>
            <BarList rows={aging} unit="órdenes" />
          </ChartCard>
          <ChartCard title="Abiertas por prioridad" subtitle="Sin contar terminadas ni canceladas" table={<BarTable rows={priority} head="Prioridad" unit="Órdenes" />}>
            <BarList rows={priority} unit="órdenes" />
          </ChartCard>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold">Carga por técnico</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr><th className="py-1.5 font-medium">Técnico</th><th className="py-1.5 text-right font-medium">Abiertas</th><th className="py-1.5 text-right font-medium">Terminadas ({days_} d)</th><th className="py-1.5 text-right font-medium">Tiempo promedio</th></tr>
            </thead>
            <tbody>
              {data.byTechnician.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{t.name}</td>
                  <td className="py-2 text-right tabular-nums">{fmtInt(t.openCount)}</td>
                  <td className="py-2 text-right tabular-nums">{fmtInt(t.doneInPeriod)}</td>
                  <td className="py-2 text-right tabular-nums">{fmtDuration(t.avgHours)}</td>
                </tr>
              ))}
              {!data.byTechnician.length && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Ningún técnico tiene órdenes abiertas ni terminadas en el periodo.</td></tr>}
            </tbody>
          </table>
        </section>

        <p className="text-xs text-slate-500">
          Los tiempos son horas corridas desde que se crea la orden hasta la primera vez que pasa a "terminada" según su historial;
          las órdenes anteriores al historial de estados no se cuentan. Las terminadas se atribuyen al técnico que tiene hoy la orden, y sus "abiertas" son las asignadas o en curso (la tarjeta de abiertas suma además las sin asignar). Los días se cuentan en la zona horaria del servidor.
        </p>
      </div>
    </div>
  );
}
