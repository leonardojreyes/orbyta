// Datos de ejemplo: dos empresas para comprobar el aislamiento multiempresa.
import { admin } from "./client.js";
import { tenants, projects, tasks, serviceOrders, serviceOrderEvents, customers, technicians } from "./schema.js";

const { db, pool, withTenant } = admin;

type OrderSeed = Omit<typeof serviceOrders.$inferInsert, "customerId" | "technicianId" | "assignedTo"> & { technician?: string };

/** Crea catálogos de la empresa y sus órdenes vinculadas, con el evento "creada" de cada una. */
async function seedCatalogsAndOrders(tx: Parameters<Parameters<typeof withTenant>[1]>[0], tenantId: string, techs: string[], orders: OrderSeed[]) {
  const cs = await tx.insert(customers).values(
    orders.map((o) => ({ tenantId, name: o.customerName, address: o.address })),
  ).returning();
  const ts = techs.length ? await tx.insert(technicians).values(techs.map((name) => ({ tenantId, name }))).returning() : [];
  const created = await tx.insert(serviceOrders).values(orders.map(({ technician, ...o }) => {
    const t = ts.find((x) => x.name === technician);
    return { ...o, customerId: cs.find((c) => c.name === o.customerName)!.id, technicianId: t?.id, assignedTo: t?.name };
  })).returning();
  await tx.insert(serviceOrderEvents).values(created.map((o) => ({ tenantId, orderId: o.id, toStatus: o.status })));
}

const [aguas, redes] = await db
  .insert(tenants)
  .values([
    { name: "Aguas del Litoral S.A.", slug: "aguas-litoral" },
    { name: "Redes Andinas Cía. Ltda.", slug: "redes-andinas" },
  ])
  .onConflictDoNothing()
  .returning();

if (!aguas || !redes) {
  console.log("Ya existen datos de ejemplo. Usa `pnpm db:reset` para empezar de cero.");
  await pool.end();
  process.exit(0);
}

await withTenant(aguas.id, async (tx) => {
  const [p1, p2] = await tx.insert(projects).values([
    { tenantId: aguas.id, code: "PRY-001", name: "Red de agua potable · Ciudadela Los Ceibos", status: "active",
      description: "Instalación de tubería matriz y 240 acometidas domiciliarias.", startDate: "2026-09-01", endDate: "2026-12-15" },
    { tenantId: aguas.id, code: "PRY-002", name: "Rehabilitación de alcantarillado · Urdesa", status: "planned",
      startDate: "2026-11-15" },
  ]).returning();
  await tx.insert(tasks).values([
    { tenantId: aguas.id, projectId: p1!.id, title: "Levantamiento topográfico", status: "done", assignee: "M. Vera" },
    { tenantId: aguas.id, projectId: p1!.id, title: "Excavación tramo A (Av. principal)", status: "in_progress", assignee: "Cuadrilla 2" },
    { tenantId: aguas.id, projectId: p1!.id, title: "Instalación de tubería PVC 160 mm", status: "todo", assignee: "Cuadrilla 2" },
    { tenantId: aguas.id, projectId: p1!.id, title: "Pruebas de presión", status: "todo" },
    { tenantId: aguas.id, projectId: p2!.id, title: "Inspección con cámara CCTV", status: "todo", assignee: "J. Mora" },
  ]);
  await seedCatalogsAndOrders(tx, aguas.id, ["Técnico R. Salas", "Técnico L. Cruz"], [
    { tenantId: aguas.id, code: "OS-0001", customerName: "Carlos Andrade", address: "Mz. 12 Villa 4, Los Ceibos",
      description: "Fuga en medidor domiciliario", priority: "high", status: "assigned", technician: "Técnico R. Salas", projectId: p1!.id },
    { tenantId: aguas.id, code: "OS-0002", customerName: "María Paredes", address: "Av. Las Aguas 210",
      description: "Sin servicio de agua desde ayer", priority: "urgent", status: "open" },
    { tenantId: aguas.id, code: "OS-0003", customerName: "Condominio Brisas", address: "Km 4.5 vía a la Costa",
      description: "Baja presión en torre B", priority: "medium", status: "in_progress", technician: "Técnico L. Cruz" },
    { tenantId: aguas.id, code: "OS-0004", customerName: "Pedro Gómez", address: "Calle 5ta y Ficus",
      description: "Cambio de medidor", priority: "low", status: "done", technician: "Técnico R. Salas" },
  ]);
});

await withTenant(redes.id, async (tx) => {
  await tx.insert(projects).values([
    { tenantId: redes.id, code: "PRY-001", name: "Tendido de fibra óptica · Samborondón", status: "active" },
  ]);
  await seedCatalogsAndOrders(tx, redes.id, [], [
    { tenantId: redes.id, code: "OS-0001", customerName: "Lucía Torres", address: "Cdla. Entre Ríos",
      description: "Corte de servicio de internet", priority: "high", status: "open" },
  ]);
});

console.log("✓ Datos de ejemplo cargados (2 empresas).");
await pool.end();
