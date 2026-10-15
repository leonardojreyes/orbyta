#!/usr/bin/env node
// Mide el presupuesto de recursos del proyecto (FASE0 §3.2). Falla con código 1 si se viola.
// Uso: pnpm recursos        Sin dependencias; Windows, macOS y Linux.
import { execFileSync } from 'node:child_process';
import { statfsSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';

const GB = 1024 ** 3;
const raiz = process.cwd();
const LIMITES = { ramGB: 2.5, discoProyectoGB: 5, discoLibreGB: 30, servidoresDev: 2 };

const salida = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};

// RAM (RSS) de procesos cuyo comando incluye la ruta del proyecto o servidores de desarrollo.
function ramProyecto() {
  if (process.platform === 'win32') return { bytes: 0, procesos: 0, nota: 'no medido en Windows' };
  const filas = salida('ps', ['-axo', 'rss=,command=']).split('\n');
  let kb = 0;
  let n = 0;
  for (const f of filas) {
    const m = f.trim().match(/^(\d+)\s+(.*)$/);
    if (!m || !m[2].includes(raiz) || m[2].includes('recursos.mjs')) continue;
    kb += Number(m[1]);
    n += 1;
  }
  return { bytes: kb * 1024, procesos: n };
}

function discoProyecto() {
  if (process.platform === 'win32') return 0;
  const kb = Number(salida('du', ['-sk', raiz]).split('\t')[0]);
  return Number.isFinite(kb) ? kb * 1024 : 0;
}

function discoLibre() {
  const s = statfsSync(join(raiz));
  return s.bavail * s.bsize;
}

function servidoresDev() {
  if (process.platform === 'win32') return 0;
  return salida('ps', ['-axo', 'command='])
    .split('\n')
    .filter((c) => c.includes(raiz) && /(vite|dist\/main\.js)/.test(c) && !c.includes('recursos.mjs'))
    .length;
}

const ram = ramProyecto();
const proyecto = discoProyecto();
const libre = discoLibre();
const servidores = servidoresDev();
const fmt = (b) => (b / GB).toFixed(2);

const filas = [
  ['RAM de procesos del proyecto', `${fmt(ram.bytes)} GB (${ram.procesos} procesos)`, `≤ ${LIMITES.ramGB} GB`, ram.bytes / GB <= LIMITES.ramGB],
  ['Disco del proyecto', `${fmt(proyecto)} GB`, `≤ ${LIMITES.discoProyectoGB} GB`, proyecto / GB <= LIMITES.discoProyectoGB],
  ['Disco libre de la máquina', `${fmt(libre)} GB`, `≥ ${LIMITES.discoLibreGB} GB`, libre / GB >= LIMITES.discoLibreGB],
  ['Servidores de desarrollo', `${servidores}`, `≤ ${LIMITES.servidoresDev}`, servidores <= LIMITES.servidoresDev],
];

console.log(`RAM total: ${fmt(os.totalmem())} GB · libre: ${fmt(os.freemem())} GB\n`);
for (const [nombre, valor, limite, ok] of filas) {
  console.log(`${ok ? '✓' : '✗'} ${nombre.padEnd(30)} ${valor.padEnd(26)} ${limite}`);
}
const falla = filas.some((f) => !f[3]);
console.log(falla ? '\n✗ Presupuesto de recursos violado.' : '\n✓ Dentro del presupuesto.');
process.exit(falla ? 1 : 0);
