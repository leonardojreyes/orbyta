import type { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { tenants } from "../db/schema.js";

export async function tenantRoutes(app: FastifyInstance) {
  // Temporal (MVP): lista de empresas para el selector. Con Keycloak, la empresa saldrá del token.
  // No incluye logo ni datos fiscales: eso se pide por empresa en GET /company.
  app.get("/tenants", async () =>
    db.select({ id: tenants.id, name: tenants.name, slug: tenants.slug }).from(tenants).orderBy(tenants.name));
}
