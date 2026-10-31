import { useState } from "react";
import { PASSWORD_MIN } from "@orbyta/shared";
import { post } from "../api";
import { Button, Field, inputCls } from "../ui";

/** Cambio de contraseña propio. Al guardar se cierran las demás sesiones abiertas del usuario. */
export function AccountView() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", repeat: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    if (form.newPassword !== form.repeat) return setMsg({ ok: false, text: "Las contraseñas nuevas no coinciden." });
    try {
      await post("/auth/password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", repeat: "" });
      setMsg({ ok: true, text: "Contraseña actualizada. Las demás sesiones abiertas se cerraron." });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  return (
    <div className="max-w-md p-6">
      <h1 className="mb-5 text-xl font-semibold">Cambiar contraseña</h1>
      <form className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
        onSubmit={(e) => { e.preventDefault(); save(); }}>
        <Field label="Contraseña actual">
          <input className={inputCls} type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </Field>
        <Field label={`Contraseña nueva (mínimo ${PASSWORD_MIN} caracteres)`}>
          <input className={inputCls} type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </Field>
        <Field label="Repite la contraseña nueva">
          <input className={inputCls} type="password" autoComplete="new-password" value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })} />
        </Field>
        {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
        <div><Button type="submit" disabled={!form.currentPassword || !form.newPassword}>Guardar</Button></div>
      </form>
    </div>
  );
}
