import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { ProjectCreate, TaskCreate, TaskUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { projects, serviceOrders, tasks } from "../db/schema.js";

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async (req) =>
    withTenant(req.tenantId, (tx) =>
      tx
        .select({
          id: projects.id, code: projects.code, name: projects.name, description: projects.description,
          status: projects.status, startDate: projects.startDate, endDate: projects.endDate,
          taskCount: sql<number>`(select count(*)::int from tasks t where t.project_id = ${projects.id} and t.deleted_at is null)`,
          doneCount: sql<number>`(select count(*)::int from tasks t where t.project_id = ${projects.id} and t.status = 'done' and t.deleted_at is null)`,
          orderCount: sql<number>`(select count(*)::int from service_orders o where o.project_id = ${projects.id} and o.deleted_at is null)`,
        })
        .from(projects)
        .where(isNull(projects.deletedAt))
        .orderBy(desc(projects.createdAt)),
    ),
  );

  app.post("/projects", async (req, reply) => {
    const body = ProjectCreate.parse(req.body);
    const row = await withTenant(req.tenantId, async (tx) => {
      const [{ n }] = (await tx.execute<{ n: number }>(sql`select count(*)::int + 1 as n from projects`)).rows as [{ n: number }];
      const [created] = await tx.insert(projects)
        .values({ ...body, tenantId: req.tenantId, code: `PRY-${String(n).padStart(3, "0")}` })
        .returning();
      return created;
    });
    return reply.code(201).send(row);
  });

  app.get<{ Params: { id: string } }>("/projects/:id/tasks", async (req) =>
    withTenant(req.tenantId, (tx) =>
      tx.select().from(tasks)
        .where(and(eq(tasks.projectId, req.params.id), isNull(tasks.deletedAt)))
        .orderBy(asc(tasks.createdAt)),
    ),
  );

  app.get<{ Params: { id: string } }>("/projects/:id/service-orders", async (req, reply) => {
    const rows = await withTenant(req.tenantId, async (tx) => {
      const [project] = await tx.select({ id: projects.id }).from(projects)
        .where(and(eq(projects.id, req.params.id), isNull(projects.deletedAt)));
      if (!project) return undefined;
      return tx.select().from(serviceOrders)
        .where(and(eq(serviceOrders.projectId, project.id), isNull(serviceOrders.deletedAt)))
        .orderBy(desc(serviceOrders.createdAt));
    });
    return rows ?? reply.code(404).send({ error: "Proyecto no encontrado" });
  });

  app.post<{ Params: { id: string } }>("/projects/:id/tasks", async (req, reply) => {
    const body = TaskCreate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.insert(tasks).values({ ...body, tenantId: req.tenantId, projectId: req.params.id }).returning(),
    );
    return reply.code(201).send(row);
  });

  app.patch<{ Params: { id: string } }>("/tasks/:id", async (req, reply) => {
    const body = TaskUpdate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.update(tasks).set({ ...body, updatedAt: sql`now()` }).where(eq(tasks.id, req.params.id)).returning(),
    );
    return row ?? reply.code(404).send({ error: "Tarea no encontrada" });
  });
}
