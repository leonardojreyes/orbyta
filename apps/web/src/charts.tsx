import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";

// Colores validados con la guía de visualización (validate_palette.js, modo claro; la app no tiene modo oscuro):
// serie 1 azul y serie 2 naranja pasan todas las comprobaciones; la rampa ordinal azul (un solo tono, de claro a oscuro) también.
export const CHART = {
  series1: "#2a78d6", series2: "#eb6834",
  ordinal: ["#86b6ef", "#5598e7", "#2a78d6", "#184f95"],
  surface: "#fcfcfb", inkSecondary: "#52514e", muted: "#898781", grid: "#e1e0d9", axis: "#c3c2b7",
} as const;

export const fmtInt = (n: number) => n.toLocaleString("es");
export const fmtDay = (iso: string, long = false) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString("es", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });
};
/** Horas → texto corto: minutos, horas o días, con coma decimal. */
export function fmtDuration(hours: number | null) {
  if (hours === null) return "—";
  const f = (n: number) => n.toLocaleString("es", { maximumFractionDigits: 1 });
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${f(hours)} h`;
  return `${f(hours / 24)} días`;
}

// ---- Tooltip: un solo cuadro por gráfico; el texto va como nodos de React (nunca como HTML) ----
type Tip = { x: number; y: number; node: ReactNode };
export function useTooltip() {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const at = (clientX: number, clientY: number, node: ReactNode) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setTip({ x: clientX - r.left, y: clientY - r.top, node });
  };
  const rect = () => box.current?.getBoundingClientRect();
  return { box, tip, at, rect, hide: () => setTip(null) };
}
export const TooltipBox = ({ tip, width }: { tip: Tip | null; width: number }) => tip && (
  <div role="tooltip" className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
    style={{ left: tip.x > width / 2 ? undefined : tip.x + 14, right: tip.x > width / 2 ? width - tip.x + 14 : undefined, top: Math.max(0, tip.y - 12) }}>
    {tip.node}
  </div>
);

// ---- Tarjeta de gráfico con la tabla equivalente (todo valor se puede leer sin pasar el cursor) ----
export function ChartCard({ title, subtitle, table, children }: { title: string; subtitle?: string; table: ReactNode; children: ReactNode }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-5">
      <figcaption className="mb-4">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </figcaption>
      {children}
      <details className="mt-4 text-xs text-slate-500">
        <summary className="cursor-pointer select-none hover:text-slate-700">Ver como tabla</summary>
        <div className="mt-2 max-h-64 overflow-auto">{table}</div>
      </details>
    </figure>
  );
}

// ---- Tarjeta de cifra (la cifra es el gráfico) ----
export const StatTile = ({ label, value, note, hero }: { label: string; value: string; note?: string; hero?: boolean }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="text-xs text-slate-500">{label}</div>
    <div className={`mt-1 font-semibold leading-none ${hero ? "text-5xl" : "text-3xl"}`}>{value}</div>
    {note && <div className="mt-2 text-xs text-slate-500">{note}</div>}
  </div>
);

// ---- Barras horizontales: marca fina (20 px), extremo de datos redondeado a 4 px, nace de una sola línea base ----
export type BarRow = { key: string; label: string; value: number; color: string };

export function BarList({ rows, unit }: { rows: BarRow[]; unit: string }) {
  const { box, tip, at, rect, hide } = useTooltip();
  const max = Math.max(1, ...rows.map((r) => r.value));
  const show = (r: BarRow) => <><div className="font-semibold text-ink">{fmtInt(r.value)} {unit}</div><div className="text-slate-500">{r.label}</div></>;
  return (
    <div ref={box} className="relative" onPointerLeave={hide}>
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[9.5rem_1fr] items-center gap-3 text-sm">
            <span className="truncate text-slate-600" title={r.label}>{r.label}</span>
            {/* La zona activa es toda la fila de la barra, no solo los píxeles pintados */}
            <div className="relative flex h-7 items-center border-l" style={{ borderColor: CHART.axis }} tabIndex={0} role="img" aria-label={`${r.label}: ${fmtInt(r.value)} ${unit}`}
              onPointerMove={(e) => at(e.clientX, e.clientY, show(r))}
              onFocus={(e) => { const b = e.currentTarget.getBoundingClientRect(); at(b.left + Math.min(b.width, 160), b.top + b.height / 2, show(r)); }}
              onBlur={hide}>
              <div className="h-5 transition-opacity hover:opacity-80"
                style={{ width: `${(r.value / max) * 86}%`, minWidth: r.value ? 2 : 0, background: r.color, borderRadius: "0 4px 4px 0" }} />
              <span className="ml-2 text-sm font-medium text-ink">{fmtInt(r.value)}</span>
            </div>
          </li>
        ))}
      </ul>
      <TooltipBox tip={tip} width={rect()?.width ?? 600} />
    </div>
  );
}

export const BarTable = ({ rows, head, unit }: { rows: BarRow[]; head: string; unit: string }) => (
  <table className="w-full text-left">
    <thead><tr><th className="py-1 font-medium">{head}</th><th className="py-1 text-right font-medium">{unit}</th></tr></thead>
    <tbody>{rows.map((r) => <tr key={r.key} className="border-t border-slate-100"><td className="py-1">{r.label}</td><td className="py-1 text-right tabular-nums">{fmtInt(r.value)}</td></tr>)}</tbody>
  </table>
);

// ---- Líneas de dos series con cursor vertical ----
const H = 230, M = { l: 34, r: 16, t: 12, b: 28 };

function niceScale(maxVal: number) {
  const raw = Math.max(1, maxVal) / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, ([1, 2, 5, 10].find((n) => n * p >= raw) ?? 10) * p);
  const top = step * Math.max(1, Math.ceil(maxVal / step));
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}

export type LineSeries = { key: string; name: string; color: string; values: number[] };

export function LineChart({ dates, series }: { dates: string[]; series: [LineSeries, LineSeries] }) {
  const { box, tip, at, rect, hide } = useTooltip();
  const [hover, setHover] = useState<number | null>(null);
  // Ancho real del contenedor: el gráfico se dibuja en píxeles reales, así la tipografía no crece con la pantalla.
  const [W, setW] = useState(760);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setW(Math.max(240, Math.floor(el.getBoundingClientRect().width)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const n = dates.length;
  const { top, ticks } = niceScale(Math.max(0, ...series.flatMap((s) => s.values)));
  const x = (i: number) => M.l + (n === 1 ? (W - M.l - M.r) / 2 : (i / (n - 1)) * (W - M.l - M.r));
  const y = (v: number) => M.t + (1 - v / top) * (H - M.t - M.b);
  const path = (s: LineSeries) => s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const xTicks = Array.from(new Set(Array.from({ length: Math.min(5, n) }, (_, k) => Math.round((k * (n - 1)) / Math.max(1, Math.min(5, n) - 1)))));

  const move = (e: RPointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * (W - M.l - M.r) + M.l; // a coordenadas del gráfico
    const i = Math.min(n - 1, Math.max(0, Math.round(((vx - M.l) / (W - M.l - M.r)) * (n - 1))));
    setHover(i);
    at(e.clientX, e.clientY, (
      <>
        <div className="mb-1 text-slate-500">{fmtDay(dates[i]!, true)}</div>
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-3" style={{ background: s.color }} />
            <span className="font-semibold text-ink">{fmtInt(s.values[i]!)}</span><span className="text-slate-500">{s.name}</span>
          </div>
        ))}
      </>
    ));
  };

  const last = n - 1;
  const [a, b] = series;
  const endsApart = Math.abs(y(a.values[last]!) - y(b.values[last]!)) >= 14; // si los extremos chocan, la leyenda y el cursor llevan los valores
  return (
    <div ref={box} className="relative" onPointerLeave={() => { hide(); setHover(null); }}>
      <div className="mb-3 flex gap-5 text-xs text-slate-600">
        {series.map((s) => <span key={s.key} className="flex items-center gap-2"><span className="inline-block h-0.5 w-4 rounded" style={{ background: s.color }} />{s.name}</span>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label={`${a.name} y ${b.name} por día. Los valores de cada día están en la tabla «Ver como tabla», debajo del gráfico.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? CHART.axis : CHART.grid} strokeWidth={1} />
            <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART.muted}>{fmtInt(t)}</text>
          </g>
        ))}
        {xTicks.map((i) => <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} fontSize={11} fill={CHART.muted}>{fmtDay(dates[i]!)}</text>)}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={H - M.b} stroke={CHART.axis} strokeWidth={1} />}
        {series.map((s) => <path key={s.key} d={path(s)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />)}
        {/* Punto final (r = 4, con anillo de 2 px del color de la superficie) y, con el cursor, el punto del día señalado */}
        {series.map((s) => {
          const i = hover ?? last;
          return <circle key={s.key} cx={x(i)} cy={y(s.values[i]!)} r={4} fill={s.color} stroke={CHART.surface} strokeWidth={2} />;
        })}
        {hover === null && endsApart && series.map((s) => (
          <text key={`l${s.key}`} x={x(last) - 10} y={y(s.values[last]!) - 9} textAnchor="end" fontSize={11} fill={CHART.inkSecondary}>{s.name} {fmtInt(s.values[last]!)}</text>
        ))}
        <rect x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} fill="transparent" onPointerMove={move} />
      </svg>
      <TooltipBox tip={tip} width={rect()?.width ?? 600} />
    </div>
  );
}

export const LineTable = ({ dates, series }: { dates: string[]; series: LineSeries[] }) => (
  <table className="w-full text-left">
    <thead><tr><th className="py-1 font-medium">Día</th>{series.map((s) => <th key={s.key} className="py-1 text-right font-medium">{s.name}</th>)}</tr></thead>
    <tbody>{dates.map((d, i) => <tr key={d} className="border-t border-slate-100"><td className="py-1">{fmtDay(d, true)}</td>{series.map((s) => <td key={s.key} className="py-1 text-right tabular-nums">{fmtInt(s.values[i]!)}</td>)}</tr>)}</tbody>
  </table>
);
