import { ilike, or, type AnyColumn } from "drizzle-orm";

/** Búsqueda por texto sin distinguir mayúsculas en varias columnas; escapa % y _ para que el texto del usuario sea literal. */
export const searchAny = (q: string, ...columns: AnyColumn[]) => {
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  return or(...columns.map((c) => ilike(c, pattern)));
};
