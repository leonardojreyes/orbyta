import type { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";
import { CompanyUpdate } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { allow } from "../auth.js";
import { tenants } from "../db/schema.js";

const columns = {
  id: tenants.id, name: tenants.name, slug: tenants.slug, logoUrl: tenants.logoUrl,
  taxId: tenants.taxId, address: tenants.address, phone: tenants.phone, email: tenants.email,
};

// `tenants` no tiene RLS: siempre se filtra por la empresa de la sesión, nunca por un id del cliente.
export async function companyRoutes(app: FastifyInstance) {
  app.get("/company", async (req, reply) => {
    const [row] = await withTenant(req.tenantId, (tx) => tx.select(columns).from(tenants).where(eq(tenants.id, req.tenantId)));
    return row ?? reply.code(404).send({ error: "Empresa no encontrada" });
  });

  app.patch("/company", { preHandler: allow("admin") }, async (req, reply) => {
    const body = CompanyUpdate.parse(req.body);
    const [row] = await withTenant(req.tenantId, (tx) =>
      tx.update(tenants).set({ ...body, updatedAt: sql`now()` }).where(eq(tenants.id, req.tenantId)).returning(columns),
    );
    return row ?? reply.code(404).send({ error: "Empresa no encontrada" });
  });
}
