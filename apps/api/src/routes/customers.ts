import type { FastifyInstance } from "fastify";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { CustomerCreate, CustomerListQuery, CustomerUpdate, type Page } from "@orbyta/shared";
import { searchAny } from "../db/search.js";
import { withTenant } from "../db/client.js";
import { customers } from "../db/schema.js";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/customers", async (req): Promise<Page<typeof customers.$inferSelect>> => {
    const { q, limit, offset } = CustomerListQuery.parse(req.query);
    const where = and(isNull(customers.deletedAt), q ? searchAny(q, customers.name, customers.taxId, customers.phone, customers.email, customers.address) : undefined);
    return withTenant(req.tenantId, async (tx) => {
      const items = await tx.select().from(customers).where(where).orderBy(asc(customers.name), asc(customers.id)).limit(limit).offset(offset);
      const total = (await tx.select({ n: sql<number>`count(*)::int` }).from(customers).where(where))[0]?.n ?? 0;
      return { items, total };
    });
  });

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
