import type { FastifyInstance } from "fastify";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { CustomerCreate, CustomerUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { customers } from "../db/schema.js";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/customers", async (req) =>
    withTenant(req.tenantId, (tx) => tx.select().from(customers).where(isNull(customers.deletedAt)).orderBy(asc(customers.name))),
  );

  app.post("/customers", async (req, reply) => {
    const body = CustomerCreate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) => tx.insert(customers).values({ ...body, tenantId: req.tenantId }).returning());
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/customers/:id", async (req, reply) => {
    const body = CustomerUpdate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.update(customers).set({ ...body, updatedAt: sql`now()` })
        .where(and(eq(customers.id, req.params.id), isNull(customers.deletedAt))).returning(),
    );
    return row ?? reply.code(404).send({ error: "Cliente no encontrado" });
  });
}
