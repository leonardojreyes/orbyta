import { useEffect, useState } from "react";
import { LABELS, type Company, type SessionUser } from "@orbyta/shared";
import { api, post, setOnUnauthorized } from "./api";
import { LoginView } from "./views/LoginView";
import { ProjectsView } from "./views/ProjectsView";
import { OrdersView } from "./views/OrdersView";
import { CustomersView } from "./views/CustomersView";
import { TechniciansView } from "./views/TechniciansView";
import { UsersView } from "./views/UsersView";
import { CompanyView } from "./views/CompanyView";

type View = "projects" | "orders" | "customers" | "technicians" | "users" | "company";
type Role = SessionUser["role"];

// Menú por rol (la API vuelve a validar cada permiso; esto solo evita mostrar lo que daría 403).
const MENU: { key: View; label: string; roles: Role[] }[] = [
  { key: "projects", label: "📁  Proyectos", roles: ["admin", "supervisor"] },
  { key: "orders", label: "🛠️  Órdenes de servicio", roles: ["admin", "supervisor", "technician"] },
  { key: "customers", label: "👥  Clientes", roles: ["admin", "supervisor"] },
  { key: "technicians", label: "🧑‍🔧  Técnicos", roles: ["admin", "supervisor"] },
  { key: "users", label: "🔑  Usuarios", roles: ["admin"] },
  { key: "company", label: "🏢  Empresa", roles: ["admin"] },
];

export function App() {
  const [me, setMe] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [view, setView] = useState<View>("orders");

  const loadCompany = () => api<Company>("/company").then(setCompany).catch(() => {});

  useEffect(() => {
    setOnUnauthorized(() => { setMe(null); setCompany(null); });
    api<SessionUser>("/auth/me").then(setMe).catch(() => setMe(null)).finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    loadCompany();
    setView(MENU.find((m) => m.roles.includes(me.role))?.key ?? "orders");
  }, [me?.id]);

  const logout = async () => { await post("/auth/logout", {}).catch(() => {}); setMe(null); setCompany(null); };

  if (checking) return null;
  if (!me) return <LoginView onLogin={setMe} />;

  const menu = MENU.filter((m) => m.roles.includes(me.role));
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
              {company?.logoUrl ? <img src={company.logoUrl} alt="" className="h-full w-full bg-white object-contain" /> : (company?.name ?? "?").charAt(0)}
            </div>
            <span className="truncate text-sm font-medium text-white">{company?.name}</span>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-1 px-3 text-sm">
          {menu.map(({ key, label }) => (
            <button key={key} onClick={() => setView(key)}
              className={`rounded-lg px-3 py-2 text-left ${view === key ? "bg-white/10 text-white" : "hover:bg-white/5"}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 px-5 py-4">
          <div className="truncate text-sm text-white">{me.name}</div>
          <div className="mb-2 text-[11px] text-slate-500">{LABELS[me.role]}</div>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-white">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {view === "projects" && <ProjectsView key={me.id} />}
        {view === "orders" && <OrdersView key={me.id} role={me.role} />}
        {view === "customers" && <CustomersView key={me.id} />}
        {view === "technicians" && <TechniciansView key={me.id} />}
        {view === "users" && <UsersView key={me.id} meId={me.id} />}
        {view === "company" && <CompanyView key={me.id} onSaved={loadCompany} />}
      </main>
    </div>
  );
}
