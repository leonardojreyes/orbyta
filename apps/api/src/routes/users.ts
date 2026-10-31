import type { FastifyInstance } from "fastify";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { UserCreate, UserUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { sessions, technicians, users } from "../db/schema.js";
import { hashPassword } from "../auth.js";

const columns = {
  id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, technicianId: users.technicianId,
};
// Drizzle envuelve el error de pg: el código SQLSTATE puede venir en `cause`.
export const isUniqueViolation = (e: unknown) =>
  [e, (e as { cause?: unknown })?.cause].some((x) => (x as { code?: string } | undefined)?.code === "23505");

/** Solo administradores (el grupo se registra con allow("admin")). */
export async function userRoutes(app: FastifyInstance) {
  app.get("/users", async (req) =>
    withTenant(req.tenantId, (tx) => tx.select(columns).from(users).where(isNull(users.deletedAt)).orderBy(asc(users.name))));

  app.post("/users", async (req, reply) => {
    const { password, ...body } = UserCreate.parse(req.body);
    const passwordHash = await hashPassword(password);
    try {
      const row = await withTenant(req.tenantId, async (tx) => {
        if (body.technicianId) {
          const [t] = await tx.select({ id: technicians.id }).from(technicians)
            .where(and(eq(technicians.id, body.technicianId), isNull(technicians.deletedAt)));
          if (!t) return { error: "Técnico no encontrado" };
        }
        const [created] = await tx.insert(users).values({ ...body, passwordHash, tenantId: req.tenantId }).returning(columns);
        return created;
      });
      if (row && "error" in row) return reply.code(400).send(row);
      return reply.code(201).send(row);
    } catch (e) {
      if (isUniqueViolation(e)) return reply.code(409).send({ error: "Ya existe un usuario con ese correo" });
      throw e;
    }
  });

  app.patch<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
    const { password, ...body } = UserUpdate.parse(req.body);
    // Un administrador no puede quitarse a sí mismo el acceso: la empresa se quedaría sin administradores.
    if (req.params.id === req.user.id && (body.role !== undefined && body.role !== "admin" || body.status === "inactive"))
      return reply.code(400).send({ error: "No puedes cambiar tu propio rol ni desactivarte" });
    const passwordHash = password ? await hashPassword(password) : undefined;

    const row = await withTenant(req.tenantId, async (tx) => {
      if (body.technicianId) {
        const [t] = await tx.select({ id: technicians.id }).from(technicians)
          .where(and(eq(technicians.id, body.technicianId), isNull(technicians.deletedAt)));
        if (!t) return { error: "Técnico no encontrado" };
      }
      const [prev] = await tx.select({ role: users.role, status: users.status }).from(users)
        .where(and(eq(users.id, req.params.id), isNull(users.deletedAt))).for("update");
      if (!prev) return undefined;
      const [updated] = await tx.update(users).set({ ...body, ...(passwordHash && { passwordHash }), updatedAt: sql`now()` })
        .where(and(eq(users.id, req.params.id), isNull(users.deletedAt))).returning(columns);
      // Cambio real de contraseña, rol o estado: se cierran sus sesiones abiertas (menos la de quien lo hace).
      const changed = passwordHash || (body.role !== undefined && body.role !== prev.role) || (body.status !== undefined && body.status !== prev.status);
      if (updated && changed) {
        await tx.update(sessions).set({ deletedAt: new Date().toISOString(), updatedAt: sql`now()` })
          .where(and(eq(sessions.userId, updated.id), isNull(sessions.deletedAt), sql`${sessions.id} <> ${req.sessionId}`));
      }
      return updated;
    });
    if (row && "error" in row) return reply.code(400).send(row);
    return row ?? reply.code(404).send({ error: "Usuario no encontrado" });
  });
}
