import type { FastifyInstance } from "fastify";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { TechnicianCreate, TechnicianUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { technicians } from "../db/schema.js";

export async function technicianRoutes(app: FastifyInstance) {
  app.get("/technicians", async (req) =>
    withTenant(req.tenantId, (tx) => tx.select().from(technicians).where(isNull(technicians.deletedAt)).orderBy(asc(technicians.name))),
  );

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
