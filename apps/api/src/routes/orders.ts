import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, asc, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { CLOSED_ORDER_STATUS, ORDER_STATUS, OrderCreate, OrderListQuery, OrderUpdate, TECHNICIAN_ORDER_TARGETS, type OrderPage } from "@orbyta/shared";
import { searchAny } from "../db/search.js";
import { withTenant } from "../db/client.js";
import { customers, projects, serviceOrderEvents, serviceOrders, technicians } from "../db/schema.js";
import type { Tx } from "../db/client.js";

type Refs = { projectId?: string | null; customerId?: string | null; technicianId?: string | null };

/** Valida proyecto, cliente y técnico (RLS limita la búsqueda a la empresa) y copia su nombre a la orden. */
async function resolveRefs(tx: Tx, body: Refs, current?: { technicianId: string | null }): Promise<{ error: string } | { names: { customerName?: string; assignedTo?: string | null } }> {
  const names: { customerName?: string; assignedTo?: string | null } = {};
  if (body.projectId) {
    const [p] = await tx.select({ id: projects.id }).from(projects)
      .where(and(eq(projects.id, body.projectId), isNull(projects.deletedAt)));
    if (!p) return { error: "Proyecto no encontrado" };
  }
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

const forbidden = { error: "No tienes permiso para esta acción" };

/** El técnico solo alcanza las órdenes asignadas a su ficha de técnico; admin y supervisor, todas. */
export const mine = (req: FastifyRequest) =>
  req.user.role !== "technician" ? undefined
    : req.user.technicianId ? eq(serviceOrders.technicianId, req.user.technicianId) : sql`false`;

export async function orderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async (req): Promise<OrderPage> => {
    const f = OrderListQuery.parse(req.query);
    // Filtros comunes (todos menos el de estado): sirven tanto para la página como para los conteos por estado.
    const base: (SQL | undefined)[] = [
      isNull(serviceOrders.deletedAt),
      mine(req), // el técnico solo ve sus órdenes, aunque pida otros filtros
      f.q ? searchAny(f.q, serviceOrders.code, serviceOrders.customerName, serviceOrders.address, serviceOrders.description, serviceOrders.assignedTo) : undefined,
      f.priority ? eq(serviceOrders.priority, f.priority) : undefined,
      f.technicianId ? eq(serviceOrders.technicianId, f.technicianId) : undefined,
      f.customerId ? eq(serviceOrders.customerId, f.customerId) : undefined,
      f.projectId === "none" ? isNull(serviceOrders.projectId) : f.projectId ? eq(serviceOrders.projectId, f.projectId) : undefined,
    ];
    const sortKey = {
      created: serviceOrders.createdAt, code: serviceOrders.code, status: serviceOrders.status,
      priority: sql`case ${serviceOrders.priority} when 'urgent' then 4 when 'high' then 3 when 'medium' then 2 else 1 end`,
      customer: sql`lower(${serviceOrders.customerName})`,
    }[f.sort];

    return withTenant(req.tenantId, async (tx) => {
      const grouped = await tx.select({ status: serviceOrders.status, n: sql<number>`count(*)::int` })
        .from(serviceOrders).where(and(...base)).groupBy(serviceOrders.status);
      const counts = Object.fromEntries(ORDER_STATUS.map((s) => [s, grouped.find((g) => g.status === s)?.n ?? 0])) as OrderPage["counts"];
      const items = await tx.select().from(serviceOrders)
        .where(and(...base, f.status ? eq(serviceOrders.status, f.status) : undefined))
        .orderBy(f.dir === "asc" ? asc(sortKey) : desc(sortKey), asc(serviceOrders.id)) // id desempata: la paginación es estable
        .limit(f.limit).offset(f.offset);
      const total = f.status ? counts[f.status] : Object.values(counts).reduce((a, b) => a + b, 0);
      return { items, total, counts };
    });
  });

  app.post("/service-orders", async (req, reply) => {
    if (req.user.role === "technician") return reply.code(403).send(forbidden);
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
    // El técnico solo puede cambiar el estado de sus órdenes.
    if (req.user.role === "technician" && Object.keys(body).some((k) => k !== "status")) return reply.code(403).send(forbidden);
    const row = await withTenant(req.tenantId, async (tx) => {
      const where = and(eq(serviceOrders.id, req.params.id), isNull(serviceOrders.deletedAt), mine(req));
      const [prev] = await tx.select({ status: serviceOrders.status, technicianId: serviceOrders.technicianId }).from(serviceOrders).where(where).for("update");
      if (!prev) return undefined;
      if (req.user.role === "technician") { // el técnico no reabre ni cancela, ni toca órdenes cerradas
        if ((CLOSED_ORDER_STATUS as readonly string[]).includes(prev.status)) return { error: "La orden ya está cerrada", forbidden: true };
        if (body.status && body.status !== prev.status && !(TECHNICIAN_ORDER_TARGETS as readonly string[]).includes(body.status)) return { error: "No puedes poner la orden en ese estado", forbidden: true };
      }
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
    if (row && "error" in row) return reply.code("forbidden" in row ? 403 : 400).send({ error: row.error });
    return row ?? reply.code(404).send({ error: "Orden no encontrada" });
  });

  app.get<{ Params: { id: string } }>("/service-orders/:id/events", async (req, reply) => {
    const events = await withTenant(req.tenantId, async (tx) => {
      const [order] = await tx.select({ id: serviceOrders.id }).from(serviceOrders)
        .where(and(eq(serviceOrders.id, req.params.id), isNull(serviceOrders.deletedAt), mine(req)));
      if (!order) return undefined;
      return tx.select().from(serviceOrderEvents)
        .where(and(eq(serviceOrderEvents.orderId, order.id), isNull(serviceOrderEvents.deletedAt)))
        .orderBy(asc(serviceOrderEvents.createdAt));
    });
    return events ?? reply.code(404).send({ error: "Orden no encontrada" });
  });
}
