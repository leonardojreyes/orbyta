import type { FastifyInstance } from "fastify";
import { desc, eq, isNull, sql } from "drizzle-orm";
import { OrderCreate, OrderUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { serviceOrders } from "../db/schema.js";

export async function orderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async (req) =>
    withTenant(req.tenantId, (tx) =>
      tx.select().from(serviceOrders).where(isNull(serviceOrders.deletedAt)).orderBy(desc(serviceOrders.createdAt)),
    ),
  );

  app.post("/service-orders", async (req, reply) => {
    const body = OrderCreate.parse(req.body);
    const row = await withTenant(req.tenantId, async (tx) => {
      const [{ n }] = (await tx.execute(sql`select count(*)::int + 1 as n from service_orders`)).rows as [{ n: number }];
      const [created] = await tx.insert(serviceOrders)
        .values({ ...body, tenantId: req.tenantId, code: `OS-${String(n).padStart(4, "0")}` })
        .returning();
      return created;
    });
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/service-orders/:id", async (req, reply) => {
    const body = OrderUpdate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.update(serviceOrders).set({ ...body, updatedAt: sql`now()` }).where(eq(serviceOrders.id, req.params.id)).returning(),
    );
    return row ?? reply.code(404).send({ error: "Orden no encontrada" });
  });
}
