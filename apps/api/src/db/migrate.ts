// Migrador mínimo: aplica en orden los .sql de /migrations que no se hayan aplicado.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { admin } from "./client.js";

const { pool } = admin;

const dir = resolve(import.meta.dirname, "../../migrations");
const client = await pool.connect();
try {
  if (process.argv.includes("--reset")) {
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    console.log("· esquema reiniciado");
  }
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())`);
  const done = new Set((await client.query<{ name: string }>("SELECT name FROM _migrations")).rows.map((r) => r.name));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    await client.query("BEGIN");
    await client.query(readFileSync(resolve(dir, file), "utf8"));
    await client.query("INSERT INTO _migrations(name) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log(`✓ ${file}`);
  }
  // Rol de la API: se reaplica siempre porque --reset borra el esquema y sus permisos.
  await client.query(readFileSync(resolve(dir, "../roles.sql"), "utf8"));
  console.log("Migraciones al día · permisos de orbyta_app aplicados.");
} catch (e) {
  await client.query("ROLLBACK").catch(() => {});
  throw e;
} finally {
  client.release();
  await pool.end();
}
