import { useEffect, useState } from "react";
import { ORDER_PRIORITY, ORDER_STATUS, LABELS, type ServiceOrder, type ServiceOrderEvent } from "@orbyta/shared";
import { api, patch } from "../api";
import { Badge, Button, Field, inputCls } from "../ui";

const fmt = (iso: string) => new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });

/** Panel lateral: edita los datos de la orden y muestra su historial de estados. */
export function OrderPanel({ order, onClose, onSaved }: { order: ServiceOrder; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(order);
  const [events, setEvents] = useState<ServiceOrderEvent[]>([]);
  const [err, setErr] = useState("");

  const loadEvents = async () => {
    try { setEvents(await api<ServiceOrderEvent[]>(`/service-orders/${order.id}/events`)); }
    catch (e) { setErr((e as Error).message); }
  };
  // Se resincroniza si la orden cambia desde fuera (p. ej. el selector de estado de la tabla).
  useEffect(() => { setForm(order); setErr(""); setEvents([]); loadEvents(); }, [order.id, order.status, order.updatedAt]);

  const save = async () => {
    try {
      await patch(`/service-orders/${order.id}`, {
        customerName: form.customerName, address: form.address, description: form.description,
        priority: form.priority, status: form.status, assignedTo: form.assignedTo,
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
        <Field label="Cliente"><input className={inputCls} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></Field>
        <Field label="Dirección"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Descripción de la falla"><textarea rows={3} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prioridad">
            <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ServiceOrder["priority"] })}>
              {ORDER_PRIORITY.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ServiceOrder["status"] })}>
              {ORDER_STATUS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Técnico asignado"><input className={inputCls} value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value || null })} /></Field>
        {err && <p className="text-sm text-rose-600">{err}</p>}
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
