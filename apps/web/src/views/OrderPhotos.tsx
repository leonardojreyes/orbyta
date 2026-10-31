import { useEffect, useRef, useState } from "react";
import { ATTACHMENT_DEFAULT_MAX_MB, ATTACHMENT_MAX_PER_ORDER, ATTACHMENT_TYPES, type Attachment, type SessionUser } from "@orbyta/shared";
import { api } from "../api";
import { Button } from "../ui";

const MAX_BYTES = ATTACHMENT_DEFAULT_MAX_MB * 1024 * 1024; // la API tiene la última palabra (MAX_UPLOAD_MB)
const MAX_SIDE = 1600;             // las fotos de móvil se reducen antes de subirlas

/** Reduce una foto grande a JPEG de hasta 1600 px por lado; si no mejora el tamaño, se sube tal cual. */
async function shrink(file: File): Promise<Blob> {
  if (file.size <= 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file); // aplica la orientación EXIF
    try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); // un PNG con transparencia no queda negro
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
    } finally { bmp.close(); } // libera la memoria de la imagen decodificada
  } catch { return file; }
}

/** Fotos de la orden: ver, subir (varias a la vez) y quitar. `locked`: orden cerrada para un técnico. */
export function OrderPhotos({ orderId, me, locked }: { orderId: string; me: { id: string; role: SessionUser["role"] }; locked: boolean }) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const current = useRef(orderId); // la orden mostrada ahora: las respuestas de otra orden se descartan
  current.current = orderId;

  const load = async (forId = orderId) => {
    try {
      const list = await api<Attachment[]>(`/service-orders/${forId}/attachments`);
      if (current.current === forId) setItems(list);
    } catch (e) { if (current.current === forId) setErr((e as Error).message); }
  };
  useEffect(() => { setItems([]); setErr(""); setBusy(false); load(orderId); }, [orderId]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const forId = orderId; // si se cambia de orden a media subida, las fotos pendientes siguen a la orden original pero no tocan la pantalla
    setBusy(true); setErr("");
    try {
      for (const file of Array.from(files)) { // una por solicitud; si una falla se avisa y se detiene
        if (!(ATTACHMENT_TYPES as readonly string[]).includes(file.type)) throw new Error(`"${file.name}": solo se admiten imágenes jpeg, png o webp.`);
        const blob = await shrink(file);
        if (blob.size > MAX_BYTES) throw new Error(`"${file.name}" pesa demasiado (máximo ${ATTACHMENT_DEFAULT_MAX_MB} MB).`);
        await api(`/service-orders/${forId}/attachments`, {
          method: "POST", body: blob, headers: { "Content-Type": blob.type, "X-File-Name": encodeURIComponent(file.name) },
        });
      }
    } catch (e) { if (current.current === forId) setErr((e as Error).message); }
    await load(forId);
    if (current.current === forId) setBusy(false);
  };

  const remove = async (a: Attachment) => {
    try { await api(`/attachments/${a.id}`, { method: "DELETE" }); await load(); }
    catch (e) { setErr((e as Error).message); }
  };

  const canRemove = (a: Attachment) => !locked && (me.role !== "technician" || a.uploadedBy === me.id);

  return (
    <section className="space-y-2 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fotos ({items.length})</h3>
        {!locked && items.length < ATTACHMENT_MAX_PER_ORDER && (
          <>
            <input ref={fileRef} type="file" multiple accept={ATTACHMENT_TYPES.join(",")} className="hidden"
              onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            <Button disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? "Subiendo…" : "+ Agregar fotos"}</Button>
          </>
        )}
      </div>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="grid grid-cols-4 gap-2">
        {items.map((a) => (
          <div key={a.id} className="group relative">
            <a href={`/api/attachments/${a.id}/file`} target="_blank" rel="noreferrer" title={`${a.fileName} · ${a.uploadedByName ?? ""}`}>
              <img src={`/api/attachments/${a.id}/file`} alt={a.fileName} loading="lazy" className="h-20 w-full rounded-lg border border-slate-200 object-cover" />
            </a>
            {canRemove(a) && (
              <button onClick={() => remove(a)} aria-label={`Quitar ${a.fileName}`}
                className="absolute right-1 top-1 hidden h-5 w-5 rounded-full bg-black/60 text-xs leading-5 text-white group-hover:block">×</button>
            )}
          </div>
        ))}
      </div>
      {!items.length && !err && <p className="text-xs text-slate-500">Sin fotos.</p>}
    </section>
  );
}
