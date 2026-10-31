import { useEffect, useRef, useState } from "react";
import { AUDIT_ACTIONS, AUDIT_TABLES, LABELS, type AuditEntry, type AuditPage, type User } from "@orbyta/shared";
import { api } from "../api";
import { Button, inputCls } from "../ui";
import { parsePgDate } from "../time";

const TABLE_LABEL: Record<string, string> = {
  service_orders: "Orden de servicio", projects: "Proyecto", tasks: "Tarea", customers: "Cliente",
  technicians: "Técnico", users: "Usuario", tenants: "Empresa", attachments: "Foto",
};
const ACTION_LABEL = { insert: "Creó", update: "Modificó", delete: "Eliminó" } as const;
const ACTION_TONE = { insert: "bg-emerald-100 text-emerald-700", update: "bg-sky-100 text-sky-700", delete: "bg-rose-100 text-rose-700" } as const;
const FIELD_LABEL: Record<string, string> = {
  status: "Estado", priority: "Prioridad", assigned_to: "Técnico", technician_id: "Ficha de técnico", customer_id: "Cliente (id)",
  project_id: "Proyecto (id)", customer_name: "Cliente", address: "Dirección", description: "Descripción", name: "Nombre",
  phone: "Teléfono", email: "Correo", tax_id: "RUC / Cédula", role: "Rol", password_hash: "Contraseña", logo_url: "Logo",
  title: "Título", file_name: "Archivo", content_type: "Tipo", size_bytes: "Tamaño (bytes)", order_id: "Orden (id)", assignee: "Responsable", due_date: "Vence", start_date: "Inicio", end_date: "Fin", deleted_at: "Eliminado",
};

const show = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const t = typeof v === "string" ? (LABELS[v] ?? v) : typeof v === "object" ? JSON.stringify(v) : String(v);
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
};

function Detail({ e }: { e: AuditEntry }) {
  if (e.action === "insert") return <span className="text-slate-500">Registro nuevo</span>;
  return (
    <ul className="space-y-0.5">
      {Object.entries(e.changes as Record<string, { old: unknown; new: unknown }>).map(([k, v]) => (
        <li key={k} className="text-xs">
          <span className="font-medium">{FIELD_LABEL[k] ?? k}:</span>{" "}
          {v.new === "[oculto]" ? <span className="text-slate-500">cambió (valor oculto)</span>
            : <><span className="text-slate-500">{show(v.old)}</span> → {show(v.new)}</>}
        </li>
      ))}
    </ul>
  );
}

/** Bitácora de auditoría (solo administradores): quién cambió qué y cuándo, más reciente primero. */
export function AuditView() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [people, setPeople] = useState<User[]>([]);
  const [f, setF] = useState({ table: "", action: "", userId: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const seq = useRef(0); // descarta respuestas viejas si cambia un filtro mientras otra consulta sigue en curso

  const load = async (cursor?: string) => {
    const mine = ++seq.current;
    setBusy(true);
    try {
      const qs = new URLSearchParams({ limit: "50" });
      for (const [k, v] of Object.entries(f)) if (v) qs.set(k, v);
      if (cursor) qs.set("cursor", cursor);
      const page = await api<AuditPage>(`/audit?${qs}`);
      if (mine !== seq.current) return;
      setItems((cur) => (cursor ? [...cur, ...page.items] : page.items));
      setNext(page.nextCursor); setErr("");
    } catch (e) { if (mine === seq.current) setErr((e as Error).message); }
    finally { if (mine === seq.current) setBusy(false); }
  };
  useEffect(() => { load(); }, [f.table, f.action, f.userId]);
  useEffect(() => { api<User[]>("/users").then(setPeople).catch(() => {}); }, []);

  return (
    <div className="p-6">
      <h1 className="mb-5 text-xl font-semibold">Bitácora</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className={inputCls} value={f.table} onChange={(e) => setF({ ...f, table: e.target.value })}>
          <option value="">Todas las entidades</option>
          {AUDIT_TABLES.map((t) => <option key={t} value={t}>{TABLE_LABEL[t]}</option>)}
        </select>
        <select className={inputCls} value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}>
          <option value="">Todas las acciones</option>
          {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
        </select>
        <select className={inputCls} value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}>
          <option value="">Todos los usuarios</option>
          {people.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Fecha", "Usuario", "Acción", "Registro", "Detalle"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-t border-slate-100 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{parsePgDate(e.createdAt).toLocaleString("es", { dateStyle: "short", timeStyle: "medium" })}</td>
                <td className="px-4 py-3">{e.userName ?? <span className="text-slate-400">Sistema</span>}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_TONE[e.action]}`}>{ACTION_LABEL[e.action]}</span></td>
                <td className="px-4 py-3"><div className="font-medium">{e.recordLabel ?? e.recordId.slice(0, 8)}</div><div className="text-xs text-slate-500">{TABLE_LABEL[e.tableName]}</div></td>
                <td className="px-4 py-3"><Detail e={e} /></td>
              </tr>
            ))}
            {!items.length && !busy && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin movimientos.</td></tr>}
          </tbody>
        </table>
      </div>
      {next && <div className="mt-4"><Button disabled={busy} onClick={() => load(next)}>{busy ? "Cargando…" : "Cargar más"}</Button></div>}
    </div>
  );
}
