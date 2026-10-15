#!/usr/bin/env node
// Instala el esquema de pg-boss y crea las colas de colas.json. Corre con el rol de migraciones
// (necesita DDL); es idempotente. Lo invoca `pnpm iniciar` y el despliegue.
import { readFileSync } from 'node:fs';
import { PgBoss } from 'pg-boss';

const url =
  process.env.DATABASE_MIGRACIONES_URL ??
  'postgres://orbyta_migraciones:orbyta_migraciones@localhost:5432/orbyta';
const colas = JSON.parse(readFileSync(new URL('./colas.json', import.meta.url), 'utf8'));

const boss = new PgBoss({ connectionString: url, supervise: false, schedule: false, registerInstance: false });
boss.on('error', (e) => console.error(e.message));
await boss.start();
try {
  for (const cola of colas) await boss.createQueue(cola);
} finally {
  await boss.stop({ graceful: false });
}
console.log(`✓ Cola instalada (${colas.length} colas)`);
