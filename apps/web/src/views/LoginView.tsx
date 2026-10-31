import { useState } from "react";
import type { SessionUser } from "@orbyta/shared";
import { post } from "../api";
import { Button, Field, inputCls } from "../ui";

// El código de empresa se recuerda en este navegador; la contraseña nunca se guarda.
const TENANT_KEY = "orbyta.tenant";

export function LoginView({ onLogin }: { onLogin: (u: SessionUser) => void }) {
  const [tenant, setTenant] = useState(localStorage.getItem(TENANT_KEY) ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const user = await post<SessionUser>("/auth/login", { tenant, email, password });
      localStorage.setItem(TENANT_KEY, tenant.trim().toLowerCase());
      onLogin(user);
    } catch (e) { setErr((e as Error).message); setPassword(""); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid h-screen place-items-center bg-slate-50">
      <form className="flex w-96 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 font-bold text-white">O</div>
          <span className="text-xl font-semibold">Orbyta</span>
        </div>
        <Field label="Código de empresa">
          <input className={inputCls} value={tenant} autoComplete="organization" autoFocus={!tenant} onChange={(e) => setTenant(e.target.value)} />
        </Field>
        <Field label="Correo">
          <input className={inputCls} type="email" value={email} autoComplete="username" autoFocus={!!tenant} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña">
          <input className={inputCls} type="password" value={password} autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <Button type="submit" disabled={busy || !tenant || !email || !password}>{busy ? "Entrando…" : "Entrar"}</Button>
      </form>
    </div>
  );
}
