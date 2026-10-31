import type { FastifyInstance } from "fastify";
import { asc, isNull } from "drizzle-orm";
import type { CustomerOption, TechnicianOption } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { customers, technicians } from "../db/schema.js";

// Listas ligeras y completas para los selectores de formularios (los listados con página están en /customers y /technicians).
// Tope de 1000: más allá de eso un <select> deja de ser usable y habrá que pasar a un buscador.
const LOOKUP_MAX = 1000;

export async function lookupRoutes(app: FastifyInstance) {
  app.get("/lookups/customers", async (req): Promise<CustomerOption[]> =>
    withTenant(req.tenantId, (tx) =>
      tx.select({ id: customers.id, name: customers.name, address: customers.address }).from(customers)
        .where(isNull(customers.deletedAt)).orderBy(asc(customers.name), asc(customers.id)).limit(LOOKUP_MAX)));

  app.get("/lookups/technicians", async (req): Promise<TechnicianOption[]> =>
    withTenant(req.tenantId, (tx) =>
      tx.select({ id: technicians.id, name: technicians.name, status: technicians.status }).from(technicians)
        .where(isNull(technicians.deletedAt)).orderBy(asc(technicians.name), asc(technicians.id)).limit(LOOKUP_MAX)));
}
