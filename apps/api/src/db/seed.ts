// Datos de ejemplo: dos empresas para comprobar el aislamiento multiempresa.
import { db, pool, withTenant } from "./client.js";
import { tenants, projects, tasks, serviceOrders } from "./schema.js";

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
  await tx.insert(serviceOrders).values([
    { tenantId: aguas.id, code: "OS-0001", customerName: "Carlos Andrade", address: "Mz. 12 Villa 4, Los Ceibos",
      description: "Fuga en medidor domiciliario", priority: "high", status: "assigned", assignedTo: "Técnico R. Salas", projectId: p1!.id },
    { tenantId: aguas.id, code: "OS-0002", customerName: "María Paredes", address: "Av. Las Aguas 210",
      description: "Sin servicio de agua desde ayer", priority: "urgent", status: "open" },
    { tenantId: aguas.id, code: "OS-0003", customerName: "Condominio Brisas", address: "Km 4.5 vía a la Costa",
      description: "Baja presión en torre B", priority: "medium", status: "in_progress", assignedTo: "Técnico L. Cruz" },
    { tenantId: aguas.id, code: "OS-0004", customerName: "Pedro Gómez", address: "Calle 5ta y Ficus",
      description: "Cambio de medidor", priority: "low", status: "done", assignedTo: "Técnico R. Salas" },
  ]);
});

await withTenant(redes.id, async (tx) => {
  await tx.insert(projects).values([
    { tenantId: redes.id, code: "PRY-001", name: "Tendido de fibra óptica · Samborondón", status: "active" },
  ]);
  await tx.insert(serviceOrders).values([
    { tenantId: redes.id, code: "OS-0001", customerName: "Lucía Torres", address: "Cdla. Entre Ríos",
      description: "Corte de servicio de internet", priority: "high", status: "open" },
  ]);
});

console.log("✓ Datos de ejemplo cargados (2 empresas).");
await pool.end();
