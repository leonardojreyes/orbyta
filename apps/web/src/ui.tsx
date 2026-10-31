import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LABELS } from "@orbyta/shared";

const TONES: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700", active: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700", done: "bg-brand-100 text-brand-700",
  todo: "bg-slate-100 text-slate-700", in_progress: "bg-sky-100 text-sky-700",
  inactive: "bg-slate-100 text-slate-500",
  open: "bg-slate-100 text-slate-700", assigned: "bg-amber-100 text-amber-700", cancelled: "bg-rose-100 text-rose-700",
  low: "bg-slate-100 text-slate-600", medium: "bg-sky-100 text-sky-700", high: "bg-orange-100 text-orange-700",
  urgent: "bg-rose-100 text-rose-700",
};

export const Badge = ({ value }: { value: string }) => (
  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TONES[value] ?? "bg-slate-100"}`}>
    {LABELS[value] ?? value}
  </span>
);

export const Button = ({ children, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 ${p.className ?? ""}`}>
    {children}
  </button>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">{label}{children}</label>
);

export const inputCls = "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-500";

/** Paginador: "26–50 de 120" con anterior / siguiente. */
export const Pager = ({ total, offset, limit, onOffset }: { total: number; offset: number; limit: number; onOffset: (o: number) => void }) => {
  if (!total) return null;
  const to = Math.min(offset + limit, total);
  const btn = "rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-40";
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <span>{offset + 1}–{to} de {total}</span>
      <div className="flex gap-2">
        <button className={btn} disabled={offset === 0} onClick={() => onOffset(Math.max(0, offset - limit))}>← Anterior</button>
        <button className={btn} disabled={to >= total} onClick={() => onOffset(offset + limit)}>Siguiente →</button>
      </div>
    </div>
  );
};

export const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <input className={`${inputCls} w-72`} type="search" maxLength={100} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
);
