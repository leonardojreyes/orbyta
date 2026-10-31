import { useEffect, useRef, useState } from "react";
import { LOGO_MAX_CHARS, type Company } from "@orbyta/shared";
import { api, patch } from "../api";
import { Button, Field, inputCls } from "../ui";

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const empty = { name: "", taxId: "", phone: "", email: "", address: "" };

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(file);
  });

/** Datos de la empresa activa y su logo. `onSaved` refresca el nombre y logo de la barra lateral. */
export function CompanyView({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState(empty);
  const [logo, setLogo] = useState<string | null>(null);
  const [savedLogo, setSavedLogo] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fill = (c: Company) => {
    setForm({ name: c.name, taxId: c.taxId ?? "", phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "" });
    setLogo(c.logoUrl); setSavedLogo(c.logoUrl);
  };
  useEffect(() => { api<Company>("/company").then(fill).catch((e) => setMsg({ ok: false, text: (e as Error).message })); }, []);

  const pickLogo = async (file?: File) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setMsg({ ok: false, text: "El logo debe ser png, jpeg, webp o svg." });
    try {
      const url = await readAsDataUrl(file);
      if (url.length > LOGO_MAX_CHARS) return setMsg({ ok: false, text: "El logo pesa demasiado (máximo 200 KB)." });
      setLogo(url); setMsg(null);
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  const save = async () => {
    try {
      const c = await patch<Company>("/company", {
        name: form.name, taxId: form.taxId || null, phone: form.phone || null,
        email: form.email || null, address: form.address || null,
        // Solo se envía si cambió: un logo anterior que no sea data URL no debe invalidar el guardado.
        ...(logo !== savedLogo && { logoUrl: logo }),
      });
      fill(c); setMsg({ ok: true, text: "Datos guardados." }); onSaved();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  return (
    <div className="max-w-2xl p-6">
      <h1 className="mb-5 text-xl font-semibold">Datos de la empresa</h1>
      <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {logo ? <img src={logo} alt="Logo de la empresa" className="h-full w-full object-contain" /> : <span className="text-xs text-slate-400">Sin logo</span>}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={fileRef} type="file" accept={TYPES.join(",")} className="hidden"
            onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="flex gap-2">
            <Button onClick={() => fileRef.current?.click()}>{logo ? "Cambiar logo" : "Subir logo"}</Button>
            {logo && <button className="text-sm text-slate-500 hover:text-rose-600" onClick={() => setLogo(null)}>Quitar</button>}
          </div>
          <p className="text-xs text-slate-500">png, jpeg, webp o svg · máximo 200 KB. Se aplica al guardar.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Field label="Nombre"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="RUC / Identificación fiscal"><input className={inputCls} value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></Field>
        <Field label="Teléfono"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Correo"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <div className="col-span-2"><Field label="Dirección"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
        {msg && <p className={`col-span-2 text-sm ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
        <div className="col-span-2"><Button onClick={save}>Guardar</Button></div>
      </div>
    </div>
  );
}
