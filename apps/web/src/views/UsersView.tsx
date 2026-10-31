import { useEffect, useState } from "react";
import { LABELS, PASSWORD_MIN, USER_ROLES, USER_STATUS, type TechnicianOption, type User } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Badge, Button, Field, inputCls } from "../ui";

const empty = { email: "", name: "", role: "supervisor", status: "active", password: "", technicianId: "" };

export function UsersView({ meId }: { meId: string }) {
  const [rows, setRows] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api<User[]>("/users").then(setRows).catch((e) => setErr((e as Error).message));
  useEffect(() => { load(); api<TechnicianOption[]>("/lookups/technicians").then(setTechnicians).catch(() => {}); }, []);

  const close = () => { setForm(empty); setEditing(null); setOpen(false); setErr(""); };
  const edit = (u: User) => {
    setForm({ email: u.email, name: u.name, role: u.role, status: u.status, password: "", technicianId: u.technicianId ?? "" });
    setEditing(u.id); setOpen(true); setErr("");
  };
  const save = async () => {
    try {
      const common = { name: form.name, role: form.role, status: form.status, technicianId: form.role === "technician" ? form.technicianId || null : null };
      if (editing) await patch(`/users/${editing}`, { ...common, ...(form.password && { password: form.password }) });
      else await post("/users", { ...common, email: form.email, password: form.password });
      close(); load();
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <Button onClick={() => (open ? close() : setOpen(true))}>{open ? "Cerrar" : "+ Nuevo usuario"}</Button>
      </div>

      {open && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Field label="Nombre"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Correo"><input className={inputCls} type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Rol">
            <select className={inputCls} value={form.role} disabled={editing === meId} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {USER_ROLES.map((r) => <option key={r} value={r}>{LABELS[r]}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} disabled={editing === meId} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {USER_STATUS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </Field>
          {form.role === "technician" && (
            <Field label="Ficha de técnico (define qué órdenes ve)">
              <select className={inputCls} value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
                <option value="">Sin vincular (no verá órdenes)</option>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          )}
          <Field label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}>
            <input className={inputCls} type="password" autoComplete="new-password" value={form.password}
              placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {err && <p className="col-span-2 text-sm text-rose-600">{err}</p>}
          <div className="col-span-2"><Button onClick={save}>{editing ? "Guardar cambios" : "Crear usuario"}</Button></div>
        </div>
      )}
      {!open && err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Nombre", "Correo", "Rol", "Estado", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium">{u.name}{u.id === meId && <span className="ml-2 text-xs text-slate-400">(tú)</span>}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">{LABELS[u.role]}</td>
                <td className="px-4 py-3"><Badge value={u.status} /></td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-brand-600 hover:underline" onClick={() => edit(u)}>Editar</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin usuarios.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
