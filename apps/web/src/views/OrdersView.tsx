import { useEffect, useState } from "react";
import { ORDER_PRIORITY, ORDER_STATUS, LABELS, type ServiceOrder, type SessionUser } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Badge, Button, Field, inputCls } from "../ui";
import { OrderPanel } from "./OrderPanel";
import { useCatalogs } from "../catalogs";
import { lockedFor, statusChoices } from "../orderStatus";

const empty = { customerId: "", customerName: "", address: "", description: "", priority: "medium", technicianId: "", projectId: "" };

export function OrdersView({ role }: { role: SessionUser["role"] }) {
  const isTech = role === "technician"; // el técnico solo ve sus órdenes y cambia su estado
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const { customers, technicians, projects, error: catalogErr } = useCatalogs(!isTech);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = () => api<ServiceOrder[]>("/service-orders").then(setOrders);
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await post("/service-orders", {
        ...form, customerId: form.customerId || undefined, technicianId: form.technicianId || undefined, projectId: form.projectId || undefined,
        status: form.technicianId ? "assigned" : "open",
      });
      setForm(empty); setOpen(false); setErr(""); load();
    } catch (e) { setErr((e as Error).message); }
  };
  const setStatus = async (o: ServiceOrder, status: string) => {
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: status as ServiceOrder["status"] } : x)));
    setErr("");
    try { await patch(`/service-orders/${o.id}`, { status }); }
    catch (e) { setErr((e as Error).message); load(); } // la API rechazó el cambio: se vuelve al estado real
  };

  const counts = Object.fromEntries(ORDER_STATUS.map((s) => [s, orders.filter((o) => o.status === s).length]));
  const selected = orders.find((o) => o.id === selectedId);
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Órdenes de servicio</h1>
        {!isTech && <Button onClick={() => setOpen(!open)}>{open ? "Cerrar" : "+ Nueva orden"}</Button>}
      </div>

      {!open && err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

      <div className="mb-5 grid grid-cols-5 gap-3">
        {ORDER_STATUS.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-xl border bg-white p-3 text-left ${filter === s ? "border-brand-500" : "border-slate-200"}`}>
            <div className="text-2xl font-semibold">{counts[s]}</div>
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Código", "Cliente", "Falla", "Proyecto", "Prioridad", "Técnico", "Estado"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} onClick={() => setSelectedId(o.id)}
                className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50/60 ${o.id === selectedId ? "bg-brand-50/60" : ""}`}>
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
            {!shown.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Sin órdenes.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && <OrderPanel order={selected} statusOnly={isTech} onClose={() => setSelectedId(null)} onSaved={load} />}
    </div>
  );
}
