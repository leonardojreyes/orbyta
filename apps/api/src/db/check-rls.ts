// Prueba de aislamiento multiempresa con la misma conexión que usa la API (DATABASE_URL).
// Falla (exit 1) si el rol puede saltarse RLS o si una empresa ve/modifica datos de otra.
import { and, eq, sql } from "drizzle-orm";
import { admin, db, pool, withTenant } from "./client.js";
import { serviceOrders, tenants } from "./schema.js";

let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failed++;
};
const rejects = (fn: () => Promise<unknown>) => fn().then(() => false, () => true);

const [role] = (await pool.query<{ rolname: string; rolsuper: boolean; rolbypassrls: boolean }>(
  "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user",
)).rows;
check(`rol "${role?.rolname}" sin superusuario`, role?.rolsuper === false);
check(`rol "${role?.rolname}" sin BYPASSRLS`, role?.rolbypassrls === false);

if (role?.rolsuper || role?.rolbypassrls) {
  // Con un rol privilegiado las pruebas de escritura modificarían datos reales: no se ejecutan.
  console.log("\nAbortado: DATABASE_URL debe apuntar al rol orbyta_app (ver .env.example).");
  await Promise.all([pool.end(), admin.pool.end()]);
  process.exit(1);
}

const [a, b] = await db.select().from(tenants).orderBy(tenants.name);
if (!a || !b) throw new Error("Se necesitan 2 empresas: corre `pnpm db:seed`.");

const total = (await admin.pool.query<{ n: number }>("select count(*)::int n from service_orders")).rows[0]!.n;
const seenA = await withTenant(a.id, (tx) => tx.select().from(serviceOrders));
const seenB = await withTenant(b.id, (tx) => tx.select().from(serviceOrders));
check("empresa A solo ve órdenes propias", seenA.length > 0 && seenA.every((o) => o.tenantId === a.id));
check("empresa B solo ve órdenes propias", seenB.length > 0 && seenB.every((o) => o.tenantId === b.id));
check("A + B cubren todas las órdenes (nada se pierde ni se comparte)", seenA.length + seenB.length === total);

const foreign = seenB[0]!;
const [leak] = await withTenant(a.id, (tx) => tx.select().from(serviceOrders).where(eq(serviceOrders.id, foreign.id)));
check("A no puede leer una orden de B por id", leak === undefined);

const touched = await withTenant(a.id, (tx) =>
  tx.update(serviceOrders).set({ priority: "low" }).where(eq(serviceOrders.id, foreign.id)).returning({ id: serviceOrders.id }),
);
check("A no puede modificar una orden de B", touched.length === 0);

check("A no puede insertar filas con tenant_id de B", await rejects(() =>
  withTenant(a.id, (tx) => tx.insert(serviceOrders).values({
    tenantId: b.id, code: "OS-RLS-TEST", customerName: "x", address: "x", description: "x",
  })),
));

check("sin empresa fijada no se ve ninguna fila", (await db.select().from(serviceOrders)).length === 0);
check("el rol no puede hacer DELETE físico", await rejects(() =>
  withTenant(a.id, (tx) => tx.execute(sql`delete from service_orders where id = ${foreign.id}`)),
));
check("el rol no puede alterar el esquema", await rejects(() => pool.query("create table _rls_probe (id int)")));

const [still] = await admin.db.select({ p: serviceOrders.priority }).from(serviceOrders)
  .where(and(eq(serviceOrders.id, foreign.id)));
check("la orden de B quedó intacta", still?.p === foreign.priority);

await Promise.all([pool.end(), admin.pool.end()]);
console.log(failed ? `\n${failed} comprobación(es) fallaron.` : "\nAislamiento multiempresa OK.");
process.exit(failed ? 1 : 0);
