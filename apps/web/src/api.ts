// Cliente HTTP mínimo. La sesión viaja en una cookie HttpOnly; la empresa sale de la sesión, no del cliente.
let onUnauthorized: () => void = () => {};
/** App registra aquí qué hacer cuando la API responde 401 (sesión vencida o cerrada). */
export const setOnUnauthorized = (fn: () => void) => { onUnauthorized = fn; };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (!res.ok) {
    if (res.status === 401 && path !== "/auth/login" && path !== "/auth/me") onUnauthorized();
    const body = await res.json().catch(() => ({}));
    // Validación Zod: indica qué campos fallaron.
    const fields = Array.isArray(body.issues) ? ` (${body.issues.map((i: { path: (string | number)[] }) => i.path.join(".")).join(", ")})` : "";
    throw new Error((body.error ?? res.statusText) + fields);
  }
  return res.json() as Promise<T>;
}
export const post = <T,>(p: string, body: unknown) => api<T>(p, { method: "POST", body: JSON.stringify(body) });
export const patch = <T,>(p: string, body: unknown) => api<T>(p, { method: "PATCH", body: JSON.stringify(body) });
