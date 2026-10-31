import { useEffect, useRef, useState } from "react";
import { ORDER_PRIORITY, ORDER_STATUS, LABELS, type OrderPage, type ServiceOrder, type SessionUser } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Badge, Button, Field, Pager, SearchBox, inputCls } from "../ui";
import { useDebounced } from "../hooks";
import { OrderPanel } from "./OrderPanel";
import { useCatalogs } from "../catalogs";
import { lockedFor, statusChoices } from "../orderStatus";

const PAGE_SIZE = 25;
const noFilters = { q: "", status: "", priority: "", technicianId: "", projectId: "", sort: "created:desc" };
const SORTS: [string, string][] = [
  ["created:desc", "Más recientes"], ["created:asc", "Más antiguas"], ["priority:desc", "Prioridad (urgente primero)"],
  ["status:asc", "Estado (alfabético)"], ["customer:asc", "Cliente (A–Z)"], ["code:asc", "Código"],
];
const empty = { customerId: "", customerName: "", address: "", description: "", priority: "medium", technicianId: "", projectId: "" };

export function OrdersView({ me }: { me: SessionUser }) {
  const isTech = me.role === "technician"; // el técnico solo ve sus órdenes y cambia su estado
  const [page, setPage] = useState<OrderPage>({ items: [], total: 0, counts: Object.fromEntries(ORDER_STATUS.map((x) => [x, 0])) as OrderPage["counts"] });
  const [filters, setFilters] = useState(noFilters);
  const [tick, setTick] = useState(0); // subir para recargar la página actual
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [loadErr, setLoadErr] = useState(""); // fallo al cargar la lista (se limpia solo al lograr cargar)
  const { customers, technicians, projects, error: catalogErr } = useCatalogs(!isTech);
  const [selected, setSelected] = useState<ServiceOrder | null>(null);
  const seq = useRef(0); // descarta respuestas viejas si los filtros cambian mientras otra consulta sigue en curso

  const q = useDebounced(filters.q);
  const [sort, dir] = filters.sort.split(":");
  const reload = () => setTick((t) => t + 1);
  const setFilter = (patch: Partial<typeof noFilters>) => setFilters((f) => ({ ...f, ...patch }));
  // La página va ligada a los filtros: al cambiar cualquiera (incluida la búsqueda ya aplicada) se vuelve a la primera sin consultas de más.
  const key = JSON.stringify([q, filters.status, filters.priority, filters.technicianId, filters.projectId, filters.sort]);
  const [pos, setPos] = useState({ key: "", offset: 0 });
  const offset = pos.key === key ? pos.offset : 0;
  const setOffset = (o: number) => setPos({ key, offset: o });

  useEffect(() => {
    const mine = ++seq.current;
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset), sort: sort!, dir: dir! });
    for (const [k, v] of Object.entries({ q, status: filters.status, priority: filters.priority, technicianId: filters.technicianId, projectId: filters.projectId })) if (v) qs.set(k, v);
    api<OrderPage>(`/service-orders?${qs}`).then((p) => {
      if (mine !== seq.current) return;
      if (!p.items.length && p.total > 0 && offset > 0) return setOffset(Math.floor((p.total - 1) / PAGE_SIZE) * PAGE_SIZE); // la última página quedó vacía
      setPage(p); setLoadErr("");
      setSelected((cur) => (cur && p.items.find((o) => o.id === cur.id)) || cur); // el panel abierto se refresca si sigue en la página
    }).catch((e) => { if (mine === seq.current) setLoadErr((e as Error).message); });
  }, [q, filters.status, filters.priority, filters.technicianId, filters.projectId, filters.sort, offset, tick]);

  const save = async () => {
    try {
      await post("/service-orders", {
        ...form, customerId: form.customerId || undefined, technicianId: form.technicianId || undefined, projectId: form.projectId || undefined,
        status: form.technicianId ? "assigned" : "open",
      });
      setForm(empty); setOpen(false); setErr(""); reload();
    } catch (e) { setErr((e as Error).message); }
  };
  const setStatus = async (o: ServiceOrder, status: string) => {
    setErr("");
    try { await patch(`/service-orders/${o.id}`, { status }); }
    catch (e) { setErr((e as Error).message); } // la API rechazó el cambio: la recarga muestra el estado real
    reload(); // también actualiza los conteos de las tarjetas
  };

  const filtered = Object.entries(filters).some(([k, v]) => v && v !== noFilters[k as keyof typeof noFilters]);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Órdenes de servicio</h1>
        {!isTech && <Button onClick={() => setOpen(!open)}>{open ? "Cerrar" : "+ Nueva orden"}</Button>}
      </div>

      {!open && (err || loadErr) && <p className="mb-3 text-sm text-rose-600">{err || loadErr}</p>}

      <div className="mb-5 grid grid-cols-5 gap-3">
        {ORDER_STATUS.map((s) => (
          <button key={s} onClick={() => setFilter({ status: filters.status === s ? "" : s })}
            className={`rounded-xl border bg-white p-3 text-left ${filters.status === s ? "border-brand-500" : "border-slate-200"}`}>
            <div className="text-2xl font-semibold">{page.counts[s]}</div>
            <div className="text-xs text-slate-500">{LABELS[s]}</div>
          </button>
        ))}
      </div>

      {open && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Field label="Cliente">
            <select className={inputCls} value={form.customerId} onChange={(e) => {
              const c = customers.find((x) => x.id === e.target.value);
              setForm({ ...form, customerId: e.target.value, customerName: c?.name ?? "", address: c?.address ?? form.address });
            }}>
              <option value="">Selecciona un cliente…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Dirección"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="Descripción de la falla"><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioridad">
              <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {ORDER_PRIORITY.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="Técnico asignado">
              <select className={inputCls} value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
                <option value="">Sin asignar</option>
                {technicians.filter((t) => t.status === "active").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Proyecto (opcional)">
            <select className={inputCls} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Sin proyecto</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          </Field>
          {(err || catalogErr) && <p className="col-span-2 text-sm text-rose-600">{err || catalogErr}</p>}
          <div className="col-span-2"><Button onClick={save}>Guardar orden</Button></div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={filters.q} onChange={(v) => setFilter({ q: v })} placeholder="Buscar por código, cliente, dirección, falla…" />
        <select className={inputCls} value={filters.priority} onChange={(e) => setFilter({ priority: e.target.value })}>
          <option value="">Toda prioridad</option>
          {ORDER_PRIORITY.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
        </select>
        {!isTech && (
          <>
            <select className={inputCls} value={filters.technicianId} onChange={(e) => setFilter({ technicianId: e.target.value })}>
              <option value="">Todo técnico</option>
              {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className={inputCls} value={filters.projectId} onChange={(e) => setFilter({ projectId: e.target.value })}>
              <option value="">Todo proyecto</option>
              <option value="none">Sin proyecto</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          </>
        )}
        <select className={inputCls} value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
          {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        {filtered && <button className="text-sm text-brand-600 hover:underline" onClick={() => setFilters(noFilters)}>Limpiar filtros</button>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Código", "Cliente", "Falla", "Proyecto", "Prioridad", "Técnico", "Estado"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {page.items.map((o) => (
              <tr key={o.id} onClick={() => setSelected(o)}
                className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50/60 ${o.id === selected?.id ? "bg-brand-50/60" : ""}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.code}</td>
                <td className="px-4 py-3"><div className="font-medium">{o.customerName}</div><div className="text-xs text-slate-500">{o.address}</div></td>
                <td className="px-4 py-3">{o.description}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{projects.find((p) => p.id === o.projectId)?.code ?? "—"}</td>
                <td className="px-4 py-3"><Badge value={o.priority} /></td>
                <td className="px-4 py-3 text-slate-600">{o.assignedTo ?? "—"}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs" value={o.status} disabled={lockedFor(isTech, o.status)} onChange={(e) => setStatus(o, e.target.value)}>
                    {statusChoices(isTech, o.status).map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!page.items.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{filtered ? "Ninguna orden coincide con los filtros." : "Sin órdenes."}</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager total={page.total} offset={offset} limit={PAGE_SIZE} onOffset={setOffset} />

      {selected && <OrderPanel order={selected} statusOnly={isTech} me={me} onClose={() => setSelected(null)} onSaved={reload} />}
    </div>
  );
}
