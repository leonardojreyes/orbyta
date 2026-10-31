import type { FastifyInstance } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { LoginInput } from "@orbyta/shared";
import { db, withTenant } from "../db/client.js";
import { sessions, tenants, users } from "../db/schema.js";
import {
  COOKIE, SESSION_DAYS, dummyHash, loginAttempt, loginSucceeded, newSessionToken, sessionCookie, verifyPassword,
} from "../auth.js";

/** Rutas públicas: solo el login. */
export async function loginRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (req, reply) => {
    const body = LoginInput.parse(req.body);
    if (!loginAttempt(req.ip, body.tenant, body.email)) return reply.code(429).send({ error: "Demasiados intentos. Espera unos minutos." });

    const [tenant] = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, body.tenant));
    const user = tenant && (await withTenant(tenant.id, async (tx) =>
      (await tx.select().from(users).where(and(eq(users.email, body.email), isNull(users.deletedAt), eq(users.status, "active"))))[0]));

    // Siempre se verifica un hash, exista o no el usuario, para no filtrar cuentas por tiempo de respuesta.
    const ok = await verifyPassword(body.password, user?.passwordHash ?? dummyHash);
    if (!tenant || !user || !ok) {
      return reply.code(401).send({ error: "Empresa, correo o contraseña incorrectos" });
    }

    loginSucceeded(req.ip, body.tenant, body.email);
    const { token, tokenHash } = newSessionToken(tenant.id);
    await withTenant(tenant.id, (tx) => tx.insert(sessions).values({
      tenantId: tenant.id, userId: user.id, tokenHash,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString(),
    }));
    reply.header("Set-Cookie", sessionCookie(token, SESSION_DAYS * 86_400));
    return { id: user.id, name: user.name, email: user.email, role: user.role, technicianId: user.technicianId };
  });
}

/** Rutas con sesión: quién soy y cerrar sesión. */
export async function sessionRoutes(app: FastifyInstance) {
  app.get("/auth/me", async (req) => req.user);

  app.post("/auth/logout", async (req, reply) => {
    await withTenant(req.tenantId, (tx) => tx.update(sessions).set({ deletedAt: new Date().toISOString() }).where(eq(sessions.id, req.sessionId)));
    reply.header("Set-Cookie", `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
    return { ok: true };
  });
}
