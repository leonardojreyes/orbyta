// Prueba de aislamiento multiempresa con la misma conexión que usa la API (DATABASE_URL).
// Falla (exit 1) si el rol puede saltarse RLS o si una empresa ve/modifica datos de otra.
import { and, eq, sql } from "drizzle-orm";
import { admin, db, pool, withTenant } from "./client.js";
import { customers, projects, serviceOrders, technicians, tenants } from "./schema.js";

let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failed++;
};
class Rollback extends Error {}
/** Ejecuta fn con RLS de la empresa indicada y siempre revierte: las pruebas de escritura no dejan rastro ni si RLS falla. */
async function probe<T>(tenantId: string, fn: Parameters<typeof withTenant<T>>[1]): Promise<T> {
  let out: T | undefined;
  await withTenant(tenantId, async (tx) => { out = await fn(tx); throw new Rollback(); }).catch((e) => { if (!(e instanceof Rollback)) throw e; });
  return out as T;
}
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

const touched = await probe(a.id, (tx) =>
  tx.update(serviceOrders).set({ priority: "low" }).where(eq(serviceOrders.id, foreign.id)).returning({ id: serviceOrders.id }),
);
check("A no puede modificar una orden de B", touched.length === 0);

check("A no puede insertar filas con tenant_id de B", await rejects(() =>
  probe(a.id, (tx) => tx.insert(serviceOrders).values({
    tenantId: b.id, code: "OS-RLS-TEST", customerName: "x", address: "x", description: "x",
  })),
));

// Catálogos: misma garantía que las órdenes.
for (const [label, table] of [["clientes", customers], ["técnicos", technicians]] as const) {
  const [mine, theirs] = await Promise.all([
    withTenant(a.id, (tx) => tx.select({ t: table.tenantId, id: table.id }).from(table)),
    withTenant(b.id, (tx) => tx.select({ t: table.tenantId, id: table.id }).from(table)),
  ]);
  check(`${label}: A y B solo ven los propios`, mine.every((r) => r.t === a.id) && theirs.every((r) => r.t === b.id));
  const other = mine[0];
  if (other) {
    const seen = await withTenant(b.id, (tx) => tx.select().from(table).where(eq(table.id, other.id)));
    check(`${label}: B no lee uno de A por id`, seen.length === 0);
    check(`${label}: B no puede modificar uno de A`, (await probe(b.id, (tx) =>
      tx.update(table).set({ name: "x" }).where(eq(table.id, other.id)).returning({ id: table.id }))).length === 0);
  }
}
const [cb] = await withTenant(b.id, (tx) => tx.select().from(customers));
const [pb] = await withTenant(b.id, (tx) => tx.select().from(projects));
const [oa] = seenA;
check("hay un cliente, un proyecto de B y una orden de A para las pruebas cruzadas", !!cb && !!pb && !!oa);
check("la orden de A no puede apuntar a un cliente de B", !!cb && !!oa && await rejects(() =>
  probe(a.id, (tx) => tx.update(serviceOrders).set({ customerId: cb.id }).where(eq(serviceOrders.id, oa.id)))));

check("la orden de A no puede apuntar a un proyecto de B", !!pb && !!oa && await rejects(() =>
  probe(a.id, (tx) => tx.update(serviceOrders).set({ projectId: pb.id }).where(eq(serviceOrders.id, oa.id)))));

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
