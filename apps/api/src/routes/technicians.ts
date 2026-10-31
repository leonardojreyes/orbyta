import type { FastifyInstance } from "fastify";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { TechnicianCreate, TechnicianListQuery, TechnicianUpdate, type Page } from "@orbyta/shared";
import { searchAny } from "../db/search.js";
import { withTenant } from "../db/client.js";
import { technicians } from "../db/schema.js";

export async function technicianRoutes(app: FastifyInstance) {
  app.get("/technicians", async (req): Promise<Page<typeof technicians.$inferSelect>> => {
    const { q, status, limit, offset } = TechnicianListQuery.parse(req.query);
    const where = and(
      isNull(technicians.deletedAt),
      status ? eq(technicians.status, status) : undefined,
      q ? searchAny(q, technicians.name, technicians.phone, technicians.email) : undefined,
    );
    return withTenant(req.tenantId, async (tx) => {
      const items = await tx.select().from(technicians).where(where).orderBy(asc(technicians.name), asc(technicians.id)).limit(limit).offset(offset);
      const total = (await tx.select({ n: sql<number>`count(*)::int` }).from(technicians).where(where))[0]?.n ?? 0;
      return { items, total };
    });
  });

  app.post("/technicians", async (req, reply) => {
    const body = TechnicianCreate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) => tx.insert(technicians).values({ ...body, tenantId: req.tenantId }).returning());
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/technicians/:id", async (req, reply) => {
    const body = TechnicianUpdate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.update(technicians).set({ ...body, updatedAt: sql`now()` })
        .where(and(eq(technicians.id, req.params.id), isNull(technicians.deletedAt))).returning(),
    );
    return row ?? reply.code(404).send({ error: "Técnico no encontrado" });
  });
}
