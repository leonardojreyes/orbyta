import { useEffect, useState } from "react";
import type { Customer } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Button, Field, inputCls } from "../ui";

const empty = { name: "", taxId: "", phone: "", email: "", address: "" };
// Campos vacíos viajan como null para poder borrar un dato al editar.
const clean = (f: typeof empty) => ({ ...f, taxId: f.taxId || null, phone: f.phone || null, email: f.email || null, address: f.address || null });

export function CustomersView() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api<Customer[]>("/customers").then(setRows);
  useEffect(() => { load(); }, []);

  const close = () => { setForm(empty); setEditing(null); setOpen(false); setErr(""); };
  const edit = (c: Customer) => {
    setForm({ name: c.name, taxId: c.taxId ?? "", phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "" });
    setEditing(c.id); setOpen(true); setErr("");
  };
  const save = async () => {
    try {
      await (editing ? patch(`/customers/${editing}`, clean(form)) : post("/customers", clean(form)));
      close(); load();
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Button onClick={() => (open ? close() : setOpen(true))}>{open ? "Cerrar" : "+ Nuevo cliente"}</Button>
      </div>

      {open && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Field label="Nombre"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="RUC / Cédula"><input className={inputCls} value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></Field>
          <Field label="Teléfono"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Correo"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="Dirección"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
          {err && <p className="col-span-2 text-sm text-rose-600">{err}</p>}
          <div className="col-span-2"><Button onClick={save}>{editing ? "Guardar cambios" : "Guardar cliente"}</Button></div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Nombre", "RUC / Cédula", "Teléfono", "Correo", "Dirección", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.address ?? "—"}</td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-brand-600 hover:underline" onClick={() => edit(c)}>Editar</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sin clientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
