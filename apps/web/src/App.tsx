import { useEffect, useRef, useState } from "react";
import type { Company, Tenant } from "@orbyta/shared";
import { api, setTenant } from "./api";
import { ProjectsView } from "./views/ProjectsView";
import { OrdersView } from "./views/OrdersView";
import { CustomersView } from "./views/CustomersView";
import { CompanyView } from "./views/CompanyView";
import { TechniciansView } from "./views/TechniciansView";

type View = "projects" | "orders" | "customers" | "technicians" | "company";

export function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setT] = useState<Tenant | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const activeId = useRef("");
  const [view, setView] = useState<View>("projects");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Tenant[]>("/tenants")
      .then((ts) => { setTenants(ts); if (ts[0]) choose(ts[0]); })
      .catch(() => setError("No se pudo conectar con la API. ¿Está corriendo `pnpm dev` y PostgreSQL?"));
  }, []);

  // Logo y nombre de la empresa activa; se ignora la respuesta si ya se cambió de empresa.
  const loadCompany = (id: string) => api<Company>("/company").then((c) => { if (activeId.current === id) setCompany(c); }).catch(() => {});
  const choose = (t: Tenant) => { setTenant(t.id); setT(t); setCompany(null); activeId.current = t.id; loadCompany(t.id); };
  const refreshCompany = () => {
    if (!tenant) return;
    api<Tenant[]>("/tenants").then(setTenants).catch(() => {});
    loadCompany(tenant.id);
  };

  return (
    <div className="flex h-screen text-ink">
      <aside className="flex w-60 flex-col bg-ink text-slate-300">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 font-bold text-white">O</div>
          <span className="text-lg font-semibold text-white">Orbyta</span>
        </div>
        <div className="px-3">
          <div className="mb-3 flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10 text-sm font-semibold text-white">
              {company?.logoUrl ? <img src={company.logoUrl} alt="" className="h-full w-full bg-white object-contain" /> : (company?.name ?? tenant?.name ?? "?").charAt(0)}
            </div>
            <span className="truncate text-sm font-medium text-white">{company?.name ?? tenant?.name}</span>
          </div>
          <label className="px-2 text-[11px] uppercase tracking-wide text-slate-500">Empresa</label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-2 py-1.5 text-sm text-white outline-none"
            value={tenant?.id ?? ""}
            onChange={(e) => { const t = tenants.find((x) => x.id === e.target.value); if (t) choose(t); }}
          >
            {tenants.map((t) => <option key={t.id} value={t.id} className="text-ink">{t.name}</option>)}
          </select>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-3 text-sm">
          {([["projects", "📁  Proyectos"], ["orders", "🛠️  Órdenes de servicio"], ["customers", "👥  Clientes"], ["technicians", "🧑‍🔧  Técnicos"], ["company", "🏢  Empresa"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setView(k)}
              className={`rounded-lg px-3 py-2 text-left ${view === k ? "bg-white/10 text-white" : "hover:bg-white/5"}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-5 py-4 text-[11px] text-slate-500">MVP v0.1 · SynapTech</div>
      </aside>

      <main className="flex-1 overflow-auto">
        {error && <div className="m-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {tenant && view === "projects" && <ProjectsView key={tenant.id} />}
        {tenant && view === "orders" && <OrdersView key={tenant.id} />}
        {tenant && view === "customers" && <CustomersView key={tenant.id} />}
        {tenant && view === "technicians" && <TechniciansView key={tenant.id} />}
        {tenant && view === "company" && <CompanyView key={tenant.id} onSaved={refreshCompany} />}
      </main>
    </div>
  );
}
