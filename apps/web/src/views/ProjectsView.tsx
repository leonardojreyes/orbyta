import { useEffect, useState } from "react";
import { TASK_STATUS, LABELS, type Project, type Task } from "@orbyta/shared";
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
                  <div className="mt-1 text-[11px] text-slate-500">{p.doneCount ?? 0}/{p.taskCount ?? 0} tareas · {pct}%</div>
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
    </>
  );
}
