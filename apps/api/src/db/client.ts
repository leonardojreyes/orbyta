import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { env } from "../env.js";
import * as schema from "./schema.js";

// Pool pequeño: suficiente para desarrollo en una Mac de 8 GB.
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 5 });
export const db = drizzle(pool, { schema });
export type Tx = Parameters<Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]>[0];

/** Ejecuta fn dentro de una transacción con RLS fijado a la empresa indicada. */
export function withTenant<T>(tenantId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
    return fn(tx);
  });
}
