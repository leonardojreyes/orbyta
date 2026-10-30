import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { env } from "./env.js";
import { tenantRoutes } from "./routes/tenants.js";
import { projectRoutes } from "./routes/projects.js";
import { orderRoutes } from "./routes/orders.js";

declare module "fastify" {
  interface FastifyRequest { tenantId: string }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const app = Fastify({ logger: { level: "info" } });
await app.register(cors, { origin: true });

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) return reply.code(400).send({ error: "Datos inválidos", issues: err.issues });
  app.log.error(err);
  return reply.code(500).send({ error: "Error interno" });
});

app.get("/api/health", async () => ({ ok: true, service: "orbyta-api" }));

await app.register(async (api) => {
  await api.register(tenantRoutes);
  // Todo lo de negocio exige empresa. MVP: header X-Tenant-Id. Fase siguiente: claim del token OIDC (Keycloak).
  await api.register(async (scoped) => {
    scoped.decorateRequest("tenantId", "");
    scoped.addHook("preHandler", async (req, reply) => {
      const t = req.headers["x-tenant-id"];
      if (typeof t !== "string" || !UUID.test(t)) return reply.code(400).send({ error: "Falta X-Tenant-Id" });
      req.tenantId = t;
    });
    await scoped.register(projectRoutes);
    await scoped.register(orderRoutes);
  });
}, { prefix: "/api" });

await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
