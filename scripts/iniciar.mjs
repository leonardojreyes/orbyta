#!/usr/bin/env node
// Prepara el entorno local de forma idempotente: versiones, dependencias, base de datos,
// roles (sin BYPASSRLS) y migraciones. Uso: pnpm iniciar [--sin-instalar]
// Respeta PGHOST/PGPORT/PGUSER/PGPASSWORD del entorno (psql los lee) para el superusuario; en el CI
// apunta al servicio de PostgreSQL del runner.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.cwd();
const BD = 'orbyta';
const sinInstalar = process.argv.includes('--sin-instalar');
const paso = (m) => console.log(`→ ${m}`);
const falla = (m) => {
  console.error(`✗ ${m}`);
  process.exit(1);
};

// 1. Versiones
const [mayor] = process.versions.node.split('.').map(Number);
if (mayor < 22) falla(`Se requiere Node 22 o superior (actual ${process.versions.node}). Usa mise.`);
paso(`Node ${process.versions.node}`);

// 2. PostgreSQL nativo (psql / pg_isready / pg_ctl)
const dirsPg = [
  '/opt/homebrew/opt/postgresql@17/bin',
  '/usr/local/opt/postgresql@17/bin',
  '/usr/lib/postgresql/17/bin',
  ...(process.env.PATH ?? '').split(process.platform === 'win32' ? ';' : ':'),
];
const ext = process.platform === 'win32' ? '.exe' : '';
const bin = (n) => {
  const d = dirsPg.find((x) => x && existsSync(join(x, n + ext)));
  if (!d) falla(`No se encontró ${n}. Instala PostgreSQL 17 (brew install postgresql@17).`);
  return join(d, n + ext);
};
const psql = bin('psql');
const listo = () => spawnSync(bin('pg_isready'), ['-q']).status === 0;
if (!listo()) {
  falla('PostgreSQL no está corriendo. Arráncalo (local: pg_ctl -D /opt/homebrew/var/postgresql@17 start).');
}
paso('PostgreSQL en ejecución');

const sql = (bd, texto, usuario) =>
  execFileSync(psql, ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-At', '-d', bd, ...(usuario ? ['-U', usuario] : []), '-c', texto], {
    encoding: 'utf8',
  }).trim();

// 3. Roles y base (roles sin BYPASSRLS ni superusuario)
const rol = (nombre, extra) => {
  if (sql('postgres', `SELECT 1 FROM pg_roles WHERE rolname='${nombre}'`) !== '1') {
    sql('postgres', `CREATE ROLE ${nombre} LOGIN PASSWORD '${nombre}' NOSUPERUSER NOBYPASSRLS NOCREATEROLE ${extra}`);
    paso(`Rol ${nombre} creado`);
  } else {
    sql('postgres', `ALTER ROLE ${nombre} NOSUPERUSER NOBYPASSRLS`);
  }
};
rol('orbyta_migraciones', 'CREATEDB');
rol('orbyta_app', '');
if (sql('postgres', `SELECT 1 FROM pg_database WHERE datname='${BD}'`) !== '1') {
  sql('postgres', `CREATE DATABASE ${BD} OWNER orbyta_migraciones`);
  paso(`Base ${BD} creada`);
}
sql(BD, 'GRANT CONNECT ON DATABASE orbyta TO orbyta_app');
sql(BD, 'GRANT USAGE ON SCHEMA public TO orbyta_app');
sql(BD, 'ALTER SCHEMA public OWNER TO orbyta_migraciones');

// 4. Migraciones (solo hacia adelante; checksum para detectar ediciones)
const comoMigraciones = (texto) =>
  execFileSync(psql, ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-At', '-U', 'orbyta_migraciones', '-h', 'localhost', '-d', BD, '-c', texto], {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: 'orbyta_migraciones' },
  }).trim();
comoMigraciones(
  'CREATE TABLE IF NOT EXISTS migraciones_aplicadas (archivo text PRIMARY KEY, checksum text NOT NULL, aplicada timestamptz NOT NULL DEFAULT now())',
);
const buscar = (base) =>
  existsSync(base)
    ? readdirSync(base, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .flatMap((d) => {
          const dir = [join(base, d.name, 'infrastructure', 'migrations'), join(base, d.name, 'migrations')].find(existsSync);
          return dir ? readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => join(dir, f)) : [];
        })
    : [];
const archivos = [...buscar(join(raiz, 'platform')), ...buscar(join(raiz, 'modules'))];
let nuevas = 0;
for (const ruta of archivos) {
  const rel = ruta.slice(raiz.length + 1);
  const texto = readFileSync(ruta, 'utf8');
  const checksum = createHash('sha256').update(texto).digest('hex');
  const previo = comoMigraciones(`SELECT checksum FROM migraciones_aplicadas WHERE archivo='${rel}'`);
  if (previo) {
    if (previo !== checksum) falla(`La migración ya aplicada ${rel} fue editada. Crea una nueva.`);
    continue;
  }
  const r = spawnSync(psql, ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-1', '-U', 'orbyta_migraciones', '-h', 'localhost', '-d', BD, '-f', ruta], {
    env: { ...process.env, PGPASSWORD: 'orbyta_migraciones' },
    stdio: 'inherit',
  });
  if (r.status !== 0) falla(`Falló la migración ${rel}`);
  comoMigraciones(`INSERT INTO migraciones_aplicadas (archivo, checksum) VALUES ('${rel}', '${checksum}')`);
  paso(`Migración aplicada: ${rel}`);
  nuevas += 1;
}
if (!nuevas) paso('Migraciones al día');

// 5. Verificación: la app no puede saltarse RLS
if (sql('postgres', "SELECT rolbypassrls OR rolsuper FROM pg_roles WHERE rolname='orbyta_app'") !== 'f')
  falla('orbyta_app tiene BYPASSRLS o es superusuario');
paso('orbyta_app sin BYPASSRLS ✓');

// 6. Archivo de entorno local (sin sobrescribir) y dependencias
if (!existsSync(join(raiz, '.env.local'))) {
  copyFileSync(join(raiz, '.env.example'), join(raiz, '.env.local'));
  paso('.env.local creado desde .env.example (agrega ANTHROPIC_API_KEY tú mismo)');
}
if (!sinInstalar) {
  paso('Instalando dependencias (pnpm install)');
  const inst = spawnSync('pnpm', ['install'], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (inst.status !== 0) falla('pnpm install falló');
}

// 7. Esquema de la cola de tareas (pg-boss) y sus colas; requiere las dependencias instaladas
const instalarColas = join(raiz, 'platform', 'eventos', 'instalar-colas.mjs');
if (existsSync(instalarColas)) {
  paso('Instalando la cola de tareas');
  const c = spawnSync('node', [instalarColas], { stdio: 'inherit' });
  if (c.status !== 0) falla('No se pudo instalar la cola de tareas');
}
console.log('\n✓ Entorno listo.');
