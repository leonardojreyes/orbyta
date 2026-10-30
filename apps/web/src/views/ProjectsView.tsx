import { useEffect, useState } from "react";
import { TASK_STATUS, ORDER_STATUS, LABELS, type Project, type ServiceOrder, type Task } from "@orbyta/shared";
import { api, patch, post } from "../api";
import { Badge, Button, inputCls } from "../ui";

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");

  const load = async (keep?: string) => {
    const ps = await api<Project[]>("/projects");
    setProjects(ps);
    setSelected(ps.find((p) => p.id === keep) ?? ps[0] ?? null);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (newName.trim().length < 2) return;
    const p = await post<Project>("/projects", { name: newName.trim() });
    setNewName("");
    load(p.id);
  };

  return (
    <div className="flex h-full">
      <section className="w-80 border-r border-slate-200 bg-white p-4">
        <h1 className="mb-3 text-lg font-semibold">Proyectos</h1>
        <div className="mb-4 flex gap-2">
          <input className={`${inputCls} flex-1`} placeholder="Nuevo proyecto…" value={newName}
            onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
          <Button onClick={create}>+</Button>
        </div>
        <ul className="flex flex-col gap-2">
          {projects.map((p) => {
            const pct = p.taskCount ? Math.round(((p.doneCount ?? 0) / p.taskCount) * 100) : 0;
            return (
              <li key={p.id}>
                <button onClick={() => setSelected(p)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === p.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center justify-between text-xs text-slate-500"><span>{p.code}</span><Badge value={p.status} /></div>
                  <div className="mt-1 text-sm font-medium">{p.name}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-1 text-[11px] text-slate-500">{p.doneCount ?? 0}/{p.taskCount ?? 0} tareas · {pct}% · {p.orderCount ?? 0} órdenes</div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="flex-1 p-6">
        {selected ? <Board project={selected} onChange={() => load(selected.id)} /> : <p className="text-slate-500">Crea tu primer proyecto.</p>}
      </section>
    </div>
  );
}

function Board({ project, onChange }: { project: Project; onChange: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const load = () => api<Task[]>(`/projects/${project.id}/tasks`).then(setTasks);
  useEffect(() => { load(); }, [project.id]);

  const add = async () => {
    if (title.trim().length < 2) return;
    await post(`/projects/${project.id}/tasks`, { title: title.trim() });
    setTitle(""); await load(); onChange();
  };
  const move = async (t: Task, status: Task["status"]) => {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, status } : x)));
    await patch(`/tasks/${t.id}`, { status }); onChange();
  };

  return (
    <>
      <div className="mb-1 text-xs text-slate-500">{project.code}</div>
      <h2 className="mb-1 text-xl font-semibold">{project.name}</h2>
      {project.description && <p className="mb-4 text-sm text-slate-600">{project.description}</p>}
      <div className="mb-5 flex max-w-md gap-2">
        <input className={`${inputCls} flex-1`} placeholder="Nueva tarea…" value={title}
          onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add}>Agregar</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {TASK_STATUS.map((s) => (
          <div key={s} className="rounded-xl bg-slate-100/70 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { const t = tasks.find((x) => x.id === e.dataTransfer.getData("id")); if (t && t.status !== s) move(t, s); }}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Badge value={s} /><span className="text-slate-400">{tasks.filter((t) => t.status === s).length}</span>
            </div>
            <div className="flex min-h-24 flex-col gap-2">
              {tasks.filter((t) => t.status === s).map((t) => (
                <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", t.id)}
                  className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                  <div className="font-medium">{t.title}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{t.assignee ?? "Sin asignar"}</span>
                    <select className="rounded bg-slate-50 text-xs" value={t.status} onChange={(e) => move(t, e.target.value as Task["status"])}>
                      {TASK_STATUS.map((x) => <option key={x} value={x}>{LABELS[x]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ProjectOrders project={project} onChange={onChange} />
    </>
  );
}

/** Órdenes de servicio del proyecto, con opción de vincular una orden que aún no tiene proyecto. */
function ProjectOrders({ project, onChange }: { project: Project; onChange: () => void }) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [free, setFree] = useState<ServiceOrder[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const [mine, all] = await Promise.all([
        api<ServiceOrder[]>(`/projects/${project.id}/service-orders`),
        api<ServiceOrder[]>("/service-orders"),
      ]);
      setOrders(mine); setFree(all.filter((o) => !o.projectId));
    } catch (e) { setErr((e as Error).message); }
  };
  useEffect(() => { setErr(""); load(); }, [project.id]);

  const link = async (id: string, projectId: string | null) => {
    try { await patch(`/service-orders/${id}`, { projectId }); await load(); onChange(); }
    catch (e) { setErr((e as Error).message); }
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Órdenes de servicio ({orders.length})</h3>
        {free.length > 0 && (
          <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs" value=""
            onChange={(e) => e.target.value && link(e.target.value, project.id)}>
            <option value="">Vincular orden existente…</option>
            {free.map((o) => <option key={o.id} value={o.id}>{o.code} · {o.customerName}</option>)}
          </select>
        )}
      </div>
      {err && <p className="mb-2 text-sm text-rose-600">{err}</p>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 first:border-t-0">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{o.code}</td>
                <td className="px-4 py-2.5"><div className="font-medium">{o.customerName}</div><div className="text-xs text-slate-500">{o.description}</div></td>
                <td className="px-4 py-2.5 text-slate-600">{o.assignedTo ?? "—"}</td>
                <td className="px-4 py-2.5"><Badge value={o.priority} /></td>
                <td className="px-4 py-2.5"><Badge value={o.status} /></td>
                <td className="px-4 py-2.5 text-right"><button className="text-xs text-slate-500 hover:text-rose-600" onClick={() => link(o.id, null)}>Desvincular</button></td>
              </tr>
            ))}
            {!orders.length && <tr><td className="px-4 py-6 text-center text-slate-500">Este proyecto no tiene órdenes de servicio.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-3 text-xs text-slate-500">
        {ORDER_STATUS.map((s) => <span key={s}>{LABELS[s]}: {orders.filter((o) => o.status === s).length}</span>)}
      </div>
    </section>
  );
}
