import { useState } from "react";
import { LABELS, TECHNICIAN_STATUS, type Technician } from "@orbyta/shared";
import { patch, post } from "../api";
import { Badge, Button, Field, Pager, SearchBox, inputCls } from "../ui";
import { useDebounced, usePagedList } from "../hooks";

const empty = { name: "", phone: "", email: "", status: "active" };
// Campos vacíos viajan como null para poder borrar un dato al editar.
const clean = (f: typeof empty) => ({ ...f, phone: f.phone || null, email: f.email || null });

export function TechniciansView() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const list = usePagedList<Technician>("/technicians", { q: useDebounced(q) });
  const rows = list.items;

  const close = () => { setForm(empty); setEditing(null); setOpen(false); setErr(""); };
  const edit = (t: Technician) => {
    setForm({ name: t.name, phone: t.phone ?? "", email: t.email ?? "", status: t.status });
    setEditing(t.id); setOpen(true); setErr("");
  };
  const save = async () => {
    try {
      await (editing ? patch(`/technicians/${editing}`, clean(form)) : post("/technicians", clean(form)));
      close(); list.reload();
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Técnicos</h1>
        <Button onClick={() => (open ? close() : setOpen(true))}>{open ? "Cerrar" : "+ Nuevo técnico"}</Button>
      </div>

      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, teléfono o correo…" /></div>
      {list.error && <p className="mb-3 text-sm text-rose-600">{list.error}</p>}

      {open && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Field label="Nombre"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {TECHNICIAN_STATUS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </Field>
          <Field label="Teléfono"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Correo"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          {err && <p className="col-span-2 text-sm text-rose-600">{err}</p>}
          <div className="col-span-2"><Button onClick={save}>{editing ? "Guardar cambios" : "Guardar técnico"}</Button></div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Nombre", "Teléfono", "Correo", "Estado", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-slate-600">{t.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{t.email ?? "—"}</td>
                <td className="px-4 py-3"><Badge value={t.status} /></td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-brand-600 hover:underline" onClick={() => edit(t)}>Editar</button></td>
              </tr>
            ))}
            {!rows.length && !list.error && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{q ? "Ningún técnico coincide con la búsqueda." : "Sin técnicos."}</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager total={list.total} offset={list.offset} limit={list.limit} onOffset={list.setOffset} />
    </div>
  );
}
