import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { env } from "./env.js";
import { loginRoutes, sessionRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/users.js";
import { allow, requireSession } from "./auth.js";
import { requestContext } from "./db/client.js";
import { auditRoutes } from "./routes/audit.js";
import type { SessionUser } from "@orbyta/shared";
import { projectRoutes } from "./routes/projects.js";
import { orderRoutes } from "./routes/orders.js";
import { companyRoutes } from "./routes/company.js";
import { attachmentRoutes } from "./routes/attachments.js";
import { lookupRoutes } from "./routes/lookups.js";
import { customerRoutes } from "./routes/customers.js";
import { technicianRoutes } from "./routes/technicians.js";

declare module "fastify" {
  interface FastifyRequest { tenantId: string; user: SessionUser; sessionId: string }
}

// trustProxy solo si hay un proxy de confianza delante (TRUST_PROXY=true); si no, req.ip sería falsificable.
const app = Fastify({ logger: { level: "info" }, trustProxy: process.env.TRUST_PROXY === "true" });
// En desarrollo la web usa el proxy de Vite (mismo origen), así que CORS no hace falta; solo se abre a orígenes listados.
await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? false });

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) return reply.code(400).send({ error: "Datos inválidos", issues: err.issues });
  // Errores del cliente de Fastify (JSON mal formado, tipo de contenido no soportado…) no son 500.
  const status = (err as { statusCode?: number }).statusCode;
  if (status && status >= 400 && status < 500) {
    const message = status === 413 ? "El archivo es demasiado grande" : status === 415 ? "Tipo de archivo no permitido" : "Solicitud inválida";
    return reply.code(status).send({ error: message });
  }
  app.log.error(err);
  return reply.code(500).send({ error: "Error interno" });
});

app.get("/api/health", async () => ({ ok: true, service: "orbyta-api" }));

await app.register(async (api) => {
  await api.register(loginRoutes); // única ruta pública

  // Todo lo demás exige sesión: la empresa y el usuario salen de la cookie, nunca de un header.
  await api.register(async (scoped) => {
    scoped.decorateRequest("tenantId", "");
    scoped.decorateRequest("user", null as unknown as SessionUser);
    scoped.decorateRequest("sessionId", "");
    // Sesión y rol en onRequest: se rechaza ANTES de leer el cuerpo (si no, un anónimo podría hacer cargar archivos grandes en memoria).
    scoped.addHook("onRequest", requireSession);
    // Desde aquí todo el trabajo de la solicitud corre con el usuario en el contexto (lo lee withTenant). Va en preHandler, ya
    // leído el cuerpo: el contexto de AsyncLocalStorage no sobrevive de forma fiable a la lectura del cuerpo.
    scoped.addHook("preHandler", (req, _reply, done) => requestContext.run({ userId: req.user.id }, done));

    await scoped.register(sessionRoutes);
    await scoped.register(orderRoutes);    // todos los roles; el técnico solo ve y actualiza las suyas
    await scoped.register(attachmentRoutes); // fotos de las órdenes: mismas reglas de acceso que las órdenes
    await scoped.register(companyRoutes);  // GET todos; PATCH solo admin

    await scoped.register(async (staff) => {
      staff.addHook("onRequest", allow("admin", "supervisor"));
      await staff.register(projectRoutes);
      await staff.register(customerRoutes);
      await staff.register(technicianRoutes);
      await staff.register(lookupRoutes);
    });
    await scoped.register(async (admin) => {
      admin.addHook("onRequest", allow("admin"));
      await admin.register(userRoutes);
      await admin.register(auditRoutes);
    });
  });
}, { prefix: "/api" });

await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
