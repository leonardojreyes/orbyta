import type { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { tenants } from "../db/schema.js";

export async function tenantRoutes(app: FastifyInstance) {
  // Temporal (MVP): lista de empresas para el selector. Con Keycloak, la empresa saldrá del token.
  app.get("/tenants", async () => db.select().from(tenants).orderBy(tenants.name));
}
