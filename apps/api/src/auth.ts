import { createHash, randomBytes, scrypt, timingSafeEqual, type BinaryLike } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { SessionUser } from "@orbyta/shared";
import { withTenant } from "./db/client.js";
import { sessions, users } from "./db/schema.js";

export const COOKIE = "orbyta_session";
export const SESSION_DAYS = 7;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---- Contraseñas: scrypt de node:crypto (sin dependencias). Formato: scrypt$N$r$p$sal$hash ----
const N = 32768, R = 8, P = 1, KEYLEN = 64;
const derive = (pw: string, salt: BinaryLike, n = N, r = R, p = P) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(pw, salt, KEYLEN, { N: n, r, p, maxmem: 128 * n * r * 2 }, (e, key) => (e ? reject(e) : resolve(key))));

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${(await derive(pw, salt)).toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !n || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(pw, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Hash de relleno: el login cuesta lo mismo exista o no el usuario (no revela qué correos existen).
export const dummyHash = await hashPassword(randomBytes(12).toString("hex"));

// ---- Sesión: cookie "<tenantId>.<secreto>"; en BD solo se guarda el SHA-256 del secreto ----
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const newSessionToken = (tenantId: string) => {
  const secret = randomBytes(32).toString("base64url");
  return { token: `${tenantId}.${secret}`, tokenHash: sha256(secret) };
};

export const sessionCookie = (token: string, maxAgeSeconds: number) =>
  `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

export const readCookieToken = (req: FastifyRequest) => {
  const raw = req.headers.cookie?.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return raw?.slice(COOKIE.length + 1);
};

/** Resuelve la sesión de la cookie. La empresa sale del token y la búsqueda ya pasa por RLS. */
export async function loadSession(token: string | undefined) {
  const dot = token?.indexOf(".") ?? -1;
  if (!token || dot < 0) return undefined;
  const tenantId = token.slice(0, dot);
  if (!UUID.test(tenantId)) return undefined;
  const tokenHash = sha256(token.slice(dot + 1));
  return withTenant(tenantId, async (tx) => {
    const [row] = await tx
      .select({ sessionId: sessions.id, id: users.id, name: users.name, email: users.email, role: users.role, technicianId: users.technicianId })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(
        eq(sessions.tokenHash, tokenHash), isNull(sessions.deletedAt), gt(sessions.expiresAt, new Date().toISOString()),
        isNull(users.deletedAt), eq(users.status, "active"),
      ));
    return row && { tenantId, sessionId: row.sessionId, user: { id: row.id, name: row.name, email: row.email, role: row.role, technicianId: row.technicianId } satisfies SessionUser };
  });
}

/** Hook global: exige sesión válida y deja req.tenantId / req.user. */
export async function requireSession(req: FastifyRequest, reply: FastifyReply) {
  const s = await loadSession(readCookieToken(req));
  if (!s) return reply.code(401).send({ error: "Sesión no válida" });
  req.tenantId = s.tenantId;
  req.user = s.user;
  req.sessionId = s.sessionId;
}

/** preHandler por rol. Se usa como `{ preHandler: allow("admin") }` o como hook de un grupo de rutas. */
export const allow = (...roles: SessionUser["role"][]) => async (req: FastifyRequest, reply: FastifyReply) => {
  if (!roles.includes(req.user.role)) return reply.code(403).send({ error: "No tienes permiso para esta acción" });
};

// ---- Límite de intentos de login (en memoria; suficiente para un solo proceso) ----
// Tres contadores por ventana: cuenta desde una IP (5), cuenta desde cualquier IP (10) y cualquier cuenta desde una IP (20),
// para frenar tanto la fuerza bruta como probar una contraseña en muchas cuentas. Se cuenta ANTES de verificar
// la contraseña, así las peticiones en paralelo no se cuelan; un login correcto devuelve el cupo.
const WINDOW_MS = 15 * 60_000, MAX_BUCKETS = 5000;
const buckets = new Map<string, { n: number; since: number }>();
// `scope` separa los contadores de cada flujo (login, cambio de contraseña): uno no agota el cupo del otro.
const bucketKeys = (ip: string, tenant: string, email: string, scope: string) =>
  [[`p|${scope}|${ip}|${tenant}|${email}`, 5], [`a|${scope}|${tenant}|${email}`, 10], [`i|${scope}|${ip}`, 20]] as const;

export function loginAttempt(ip: string, tenant: string, email: string, scope = "login") {
  const now = Date.now();
  let allowed = true;
  for (const [key, limit] of bucketKeys(ip, tenant, email, scope)) {
    let b = buckets.get(key);
    if (!b || now - b.since > WINDOW_MS) { b = { n: 0, since: now }; buckets.set(key, b); }
    if (++b.n > limit) allowed = false;
  }
  if (buckets.size > MAX_BUCKETS) { // primero lo vencido; si no basta, lo más antiguo (nunca se vacía todo el mapa)
    for (const [k, b] of buckets) if (now - b.since > WINDOW_MS) buckets.delete(k);
    for (const k of buckets.keys()) { if (buckets.size <= MAX_BUCKETS) break; buckets.delete(k); }
  }
  return allowed;
}

export function loginSucceeded(ip: string, tenant: string, email: string, scope = "login") {
  const [pair, account, byIp] = bucketKeys(ip, tenant, email, scope);
  buckets.delete(pair[0]); buckets.delete(account[0]);
  const b = buckets.get(byIp[0]);
  if (b && b.n > 0) b.n--;
}
