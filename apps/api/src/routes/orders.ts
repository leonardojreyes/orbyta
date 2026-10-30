import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { OrderCreate, OrderUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { serviceOrderEvents, serviceOrders } from "../db/schema.js";

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
      if (!created) throw new Error("No se pudo crear la orden");
      await tx.insert(serviceOrderEvents).values({ tenantId: req.tenantId, orderId: created.id, toStatus: created.status });
      return created;
    });
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/service-orders/:id", async (req, reply) => {
    const body = OrderUpdate.parse(req.body);
    const row = await withTenant(req.tenantId, async (tx) => {
      const where = and(eq(serviceOrders.id, req.params.id), isNull(serviceOrders.deletedAt));
      const [prev] = await tx.select({ status: serviceOrders.status }).from(serviceOrders).where(where).for("update");
      if (!prev) return undefined;
      const [updated] = await tx.update(serviceOrders).set({ ...body, updatedAt: sql`now()` }).where(where).returning();
      if (!updated) return undefined;
      if (updated.status !== prev.status) {
        await tx.insert(serviceOrderEvents).values({
          tenantId: req.tenantId, orderId: updated.id, fromStatus: prev.status, toStatus: updated.status,
        });
      }
      return updated;
    });
    return row ?? reply.code(404).send({ error: "Orden no encontrada" });
  });

  app.get<{ Params: { id: string } }>("/service-orders/:id/events", async (req, reply) => {
    const events = await withTenant(req.tenantId, async (tx) => {
      const [order] = await tx.select({ id: serviceOrders.id }).from(serviceOrders)
        .where(and(eq(serviceOrders.id, req.params.id), isNull(serviceOrders.deletedAt)));
      if (!order) return undefined;
      return tx.select().from(serviceOrderEvents)
        .where(and(eq(serviceOrderEvents.orderId, order.id), isNull(serviceOrderEvents.deletedAt)))
        .orderBy(asc(serviceOrderEvents.createdAt));
    });
    return events ?? reply.code(404).send({ error: "Orden no encontrada" });
  });
}
