import { useEffect, useRef, useState } from "react";
import { api } from "./api";

/** Devuelve `value` solo cuando deja de cambiar durante `ms` (para no consultar en cada tecla). */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/**
 * Lista paginada desde la API ({ items, total }). Al cambiar `params` vuelve a la primera página; `reload` repite la consulta
 * actual (tras guardar). Descarta respuestas viejas y retrocede si la última página queda vacía.
 */
export function usePagedList<T>(path: string, params: Record<string, string>, limit = 25) {
  const [data, setData] = useState<{ items: T[]; total: number }>({ items: [], total: 0 });
  const [pos, setPos] = useState({ key: "", offset: 0 });
  const [tick, setTick] = useState(0);
  const [error, setError] = useState("");
  const seq = useRef(0);

  const key = JSON.stringify(params);
  const offset = pos.key === key ? pos.offset : 0;
  const setOffset = (o: number) => setPos({ key, offset: o });

  useEffect(() => {
    const mine = ++seq.current;
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    api<{ items: T[]; total: number }>(`${path}?${qs}`).then((p) => {
      if (mine !== seq.current) return;
      if (!p.items.length && p.total > 0 && offset > 0) return setOffset(Math.floor((p.total - 1) / limit) * limit);
      setData(p); setError("");
    }).catch((e) => { if (mine === seq.current) setError((e as Error).message); });
  }, [path, key, offset, tick, limit]);

  return { ...data, offset, limit, setOffset, reload: () => setTick((t) => t + 1), error };
}
