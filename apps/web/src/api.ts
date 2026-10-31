// Cliente HTTP mínimo. Toda llamada de negocio lleva la empresa activa.
let tenantId = "";
export const setTenant = (id: string) => { tenantId = id; };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(tenantId ? { "X-Tenant-Id": tenantId } : {}), ...init.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Validación Zod: indica qué campos fallaron.
    const fields = Array.isArray(body.issues) ? ` (${body.issues.map((i: { path: (string | number)[] }) => i.path.join(".")).join(", ")})` : "";
    throw new Error((body.error ?? res.statusText) + fields);
  }
  return res.json() as Promise<T>;
}
export const post = <T,>(p: string, body: unknown) => api<T>(p, { method: "POST", body: JSON.stringify(body) });
export const patch = <T,>(p: string, body: unknown) => api<T>(p, { method: "PATCH", body: JSON.stringify(body) });
