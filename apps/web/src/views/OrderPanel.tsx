import { useEffect, useState } from "react";
import { ORDER_PRIORITY, ORDER_STATUS, LABELS, type ServiceOrder, type ServiceOrderEvent } from "@orbyta/shared";
import { api, patch } from "../api";
import { Badge, Button, Field, inputCls } from "../ui";
import { useCatalogs } from "../catalogs";

const fmt = (iso: string) => new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });

/** Panel lateral: edita los datos de la orden y muestra su historial de estados. */
export function OrderPanel({ order, statusOnly, onClose, onSaved }: { order: ServiceOrder; statusOnly: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(order);
  const [events, setEvents] = useState<ServiceOrderEvent[]>([]);
  const [err, setErr] = useState("");
  const { customers, technicians, projects, error: catalogErr } = useCatalogs(!statusOnly);

  const loadEvents = async () => {
    try { setEvents(await api<ServiceOrderEvent[]>(`/service-orders/${order.id}/events`)); }
    catch (e) { setErr((e as Error).message); }
  };
  // Se resincroniza si la orden cambia desde fuera (p. ej. el selector de estado de la tabla).
  useEffect(() => { setForm(order); setErr(""); setEvents([]); loadEvents(); }, [order.id, order.status, order.updatedAt]);

  const save = async () => {
    try {
      // El técnico solo puede cambiar el estado; la API rechaza cualquier otro campo.
      await patch(`/service-orders/${order.id}`, statusOnly ? { status: form.status } : {
        projectId: form.projectId, customerId: form.customerId, customerName: form.customerName, address: form.address, description: form.description,
        priority: form.priority, status: form.status, technicianId: form.technicianId,
      });
      setErr(""); onSaved(); loadEvents();
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-10 flex w-[420px] flex-col border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="font-mono text-xs text-slate-500">{order.code}</div>
          <h2 className="text-lg font-semibold">Detalle de la orden</h2>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="text-xl text-slate-400 hover:text-slate-700">×</button>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
        <Field label="Cliente">
          <select disabled={statusOnly} className={inputCls} value={form.customerId ?? ""} onChange={(e) => {
            const c = customers.find((x) => x.id === e.target.value);
            setForm({ ...form, customerId: c?.id ?? null, customerName: c?.name ?? form.customerName });
          }}>
            {(statusOnly || !form.customerId) && <option value={form.customerId ?? ""}>{form.customerName}{form.customerId ? "" : " (sin vincular)"}</option>}
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Dirección"><input disabled={statusOnly} className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Descripción de la falla"><textarea rows={3} disabled={statusOnly} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prioridad">
            <select disabled={statusOnly} className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ServiceOrder["priority"] })}>
              {ORDER_PRIORITY.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ServiceOrder["status"] })}>
              {ORDER_STATUS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Proyecto">
          <select disabled={statusOnly} className={inputCls} value={form.projectId ?? ""} onChange={(e) => setForm({ ...form, projectId: e.target.value || null })}>
            <option value="">{statusOnly && form.projectId ? "Con proyecto" : "Sin proyecto"}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
          </select>
        </Field>
        <Field label="Técnico asignado">
          <select disabled={statusOnly} className={inputCls} value={form.technicianId ?? ""} onChange={(e) => {
            const technicianId = e.target.value || null;
            setForm({ ...form, technicianId, status: technicianId && form.status === "open" ? "assigned" : form.status });
          }}>
            <option value="">{statusOnly && form.assignedTo ? form.assignedTo : "Sin asignar"}</option>
            {technicians.filter((t) => t.status === "active" || t.id === form.technicianId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        {(err || catalogErr) && <p className="text-sm text-rose-600">{err || catalogErr}</p>}
        <Button onClick={save}>Guardar cambios</Button>

        <h3 className="pt-3 text-sm font-semibold">Historial de estados</h3>
        <ol className="space-y-2 border-l border-slate-200 pl-4">
          {events.map((ev) => (
            <li key={ev.id} className="text-sm">
              <div className="flex items-center gap-1.5">
                {ev.fromStatus ? <><Badge value={ev.fromStatus} /><span className="text-slate-400">→</span></> : <span className="text-xs text-slate-500">Creada como</span>}
                <Badge value={ev.toStatus} />
              </div>
              <div className="text-xs text-slate-500">{fmt(ev.createdAt)}</div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
