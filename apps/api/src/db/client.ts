import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { env } from "../env.js";
import * as schema from "./schema.js";

export type Tx = Parameters<Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]>[0];

/** Usuario de la solicitud en curso; withTenant lo pasa a PostgreSQL (app.user_id) para la bitácora de auditoría. */
export const requestContext = new AsyncLocalStorage<{ userId: string }>();

function connect(connectionString: string) {
  // Pool pequeño: suficiente para desarrollo en una Mac de 8 GB.
  const pool = new pg.Pool({ connectionString, max: 5 });
  const db = drizzle(pool, { schema });
  /** Ejecuta fn dentro de una transacción con RLS fijado a la empresa indicada. */
  const withTenant = <T>(tenantId: string, fn: (tx: Tx) => Promise<T>): Promise<T> => {
    // Se lee aquí, en el contexto de la solicitud, y no dentro del callback de la transacción.
    const userId = requestContext.getStore()?.userId;
    return db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
      if (userId) await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
      return fn(tx);
    });
  };
  return { pool, db, withTenant };
}

// API: rol sin privilegios, RLS siempre aplicado.
export const { pool, db, withTenant } = connect(env.DATABASE_URL);
// Solo scripts de base de datos (migrar, seed): rol dueño del esquema.
export const admin = connect(env.DATABASE_ADMIN_URL);
