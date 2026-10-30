import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { ProjectCreate, TaskCreate, TaskUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { projects, tasks } from "../db/schema.js";

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async (req) =>
    withTenant(req.tenantId, (tx) =>
      tx
        .select({
          id: projects.id, code: projects.code, name: projects.name, description: projects.description,
          status: projects.status, startDate: projects.startDate, endDate: projects.endDate,
          taskCount: sql<number>`(select count(*)::int from tasks t where t.project_id = ${projects.id} and t.deleted_at is null)`,
          doneCount: sql<number>`(select count(*)::int from tasks t where t.project_id = ${projects.id} and t.status = 'done' and t.deleted_at is null)`,
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
