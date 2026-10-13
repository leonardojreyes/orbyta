#!/usr/bin/env node
// Stop: tipos y pruebas solo de los paquetes tocados, y gitleaks. Si algo falla, Claude lo corrige.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { bloquear, leerEntrada } from './util.mjs';

if (leerEntrada().stop_hook_active) process.exit(0); // evita bucles

const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const correr = (cmd, args) => spawnSync(cmd, args, { cwd: raiz, encoding: 'utf8', shell: process.platform === 'win32' });

const estado = correr('git', ['status', '--porcelain', '-uall']);
if (estado.status !== 0) process.exit(0); // no es un repositorio git
const cambios = estado.stdout.split('\n').map((l) => l.slice(3).trim()).filter(Boolean);

const paquetes = new Set();
for (const f of cambios) {
  const m = f.match(/^(apps|modules|platform|packages)\/([^/]+)\//);
  if (m && existsSync(`${raiz}/${m[1]}/${m[2]}/package.json`)) paquetes.add(`./${m[1]}/${m[2]}`);
}

const fallos = [];
for (const p of paquetes) {
  for (const tarea of ['typecheck', 'test']) {
    const r = correr('pnpm', ['--filter', p, '--if-present', tarea]);
    if (r.status !== 0) fallos.push(`${tarea} falló en ${p}:\n${(r.stdout + r.stderr).slice(-1500)}`);
  }
}

if (cambios.length) {
  const g = correr('gitleaks', ['dir', '.', '--no-banner', '--redact', '--exit-code', '2']);
  if (g.error) {
    process.stderr.write('Aviso: gitleaks no está instalado; omitido.\n');
  } else if (g.status !== 0) {
    fallos.push(`gitleaks detectó posibles secretos:\n${(g.stdout + g.stderr).slice(-1500)}`);
  }
}

if (fallos.length) bloquear(fallos.join('\n\n'));
