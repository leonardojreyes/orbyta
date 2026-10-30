import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { OrderCreate, OrderUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { customers, serviceOrderEvents, serviceOrders, technicians } from "../db/schema.js";
import type { Tx } from "../db/client.js";

type Refs = { customerId?: string | null; technicianId?: string | null };

/** Valida cliente/técnico del catálogo (RLS limita la búsqueda a la empresa) y copia su nombre a la orden. */
async function resolveRefs(tx: Tx, body: Refs, current?: { technicianId: string | null }): Promise<{ error: string } | { names: { customerName?: string; assignedTo?: string | null } }> {
  const names: { customerName?: string; assignedTo?: string | null } = {};
  if (body.customerId) {
    const [c] = await tx.select({ name: customers.name }).from(customers)
      .where(and(eq(customers.id, body.customerId), isNull(customers.deletedAt)));
    if (!c) return { error: "Cliente no encontrado" };
    names.customerName = c.name;
  }
  if (body.technicianId) {
    const [t] = await tx.select({ name: technicians.name, status: technicians.status }).from(technicians)
      .where(and(eq(technicians.id, body.technicianId), isNull(technicians.deletedAt)));
    if (!t) return { error: "Técnico no encontrado" };
    // Un técnico inactivo solo se rechaza al asignarlo; no bloquea editar órdenes que ya lo tenían.
    if (t.status !== "active" && body.technicianId !== current?.technicianId) return { error: "Técnico inactivo" };
    names.assignedTo = t.name;
  } else if (body.technicianId === null) names.assignedTo = null;
  return { names };
}

export async function orderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async (req) =>
    withTenant(req.tenantId, (tx) =>
      tx.select().from(serviceOrders).where(isNull(serviceOrders.deletedAt)).orderBy(desc(serviceOrders.createdAt)),
    ),
  );

  app.post("/service-orders", async (req, reply) => {
    const body = OrderCreate.parse(req.body);
    const row = await withTenant(req.tenantId, async (tx) => {
      const refs = await resolveRefs(tx, body);
      if ("error" in refs) return refs;
      const [{ n }] = (await tx.execute(sql`select count(*)::int + 1 as n from service_orders`)).rows as [{ n: number }];
      const [created] = await tx.insert(serviceOrders)
        .values({ ...body, ...refs.names, assignedTo: refs.names.assignedTo ?? body.assignedTo, tenantId: req.tenantId, code: `OS-${String(n).padStart(4, "0")}` })
        .returning();
      if (!created) throw new Error("No se pudo crear la orden");
      await tx.insert(serviceOrderEvents).values({ tenantId: req.tenantId, orderId: created.id, toStatus: created.status });
      return created;
    });
    if ("error" in row) return reply.code(400).send(row);
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/service-orders/:id", async (req, reply) => {
    const body = OrderUpdate.parse(req.body);
    const row = await withTenant(req.tenantId, async (tx) => {
      const where = and(eq(serviceOrders.id, req.params.id), isNull(serviceOrders.deletedAt));
      const [prev] = await tx.select({ status: serviceOrders.status, technicianId: serviceOrders.technicianId }).from(serviceOrders).where(where).for("update");
      if (!prev) return undefined;
      const refs = await resolveRefs(tx, body, prev);
      if ("error" in refs) return refs;
      const [updated] = await tx.update(serviceOrders).set({ ...body, ...refs.names, updatedAt: sql`now()` }).where(where).returning();
      if (!updated) return undefined;
      if (updated.status !== prev.status) {
        await tx.insert(serviceOrderEvents).values({
          tenantId: req.tenantId, orderId: updated.id, fromStatus: prev.status, toStatus: updated.status,
        });
      }
      return updated;
    });
    if (row && "error" in row) return reply.code(400).send(row);
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
