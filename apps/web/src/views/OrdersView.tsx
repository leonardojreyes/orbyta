import { useEffect, useState } from "react";
import { ORDER_PRIORITY, ORDER_STATUS, LABELS, type ServiceOrder } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Badge, Button, Field, inputCls } from "../ui";

const empty = { customerName: "", address: "", description: "", priority: "medium", assignedTo: "" };

export function OrdersView() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api<ServiceOrder[]>("/service-orders").then(setOrders);
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await post("/service-orders", { ...form, assignedTo: form.assignedTo || undefined, status: form.assignedTo ? "assigned" : "open" });
      setForm(empty); setOpen(false); setErr(""); load();
    } catch (e) { setErr((e as Error).message); }
  };
  const setStatus = async (o: ServiceOrder, status: string) => {
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: status as ServiceOrder["status"] } : x)));
    await patch(`/service-orders/${o.id}`, { status });
  };

  const counts = Object.fromEntries(ORDER_STATUS.map((s) => [s, orders.filter((o) => o.status === s).length]));
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Órdenes de servicio</h1>
        <Button onClick={() => setOpen(!open)}>{open ? "Cerrar" : "+ Nueva orden"}</Button>
      </div>

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
          <Field label="Cliente"><input className={inputCls} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></Field>
          <Field label="Dirección"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="Descripción de la falla"><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioridad">
              <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {ORDER_PRIORITY.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="Técnico asignado"><input className={inputCls} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></Field>
          </div>
          {err && <p className="col-span-2 text-sm text-rose-600">{err}</p>}
          <div className="col-span-2"><Button onClick={save}>Guardar orden</Button></div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Código", "Cliente", "Falla", "Prioridad", "Técnico", "Estado"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.code}</td>
                <td className="px-4 py-3"><div className="font-medium">{o.customerName}</div><div className="text-xs text-slate-500">{o.address}</div></td>
                <td className="px-4 py-3">{o.description}</td>
                <td className="px-4 py-3"><Badge value={o.priority} /></td>
                <td className="px-4 py-3 text-slate-600">{o.assignedTo ?? "—"}</td>
                <td className="px-4 py-3">
                  <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs" value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                    {ORDER_STATUS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sin órdenes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
