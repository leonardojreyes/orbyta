#!/usr/bin/env node
// Mide el contexto que Claude Code carga y verifica los presupuestos de líneas.
// Uso: pnpm contexto        (falla con código 1 si algo supera su presupuesto)
// Sin dependencias; funciona en Windows, macOS y Linux.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const raiz = process.cwd();
const IGNORAR = new Set(['node_modules', '.git', 'dist', '.turbo', 'coverage']);

// Presupuestos por defecto (líneas sin contar comentarios HTML). Un archivo puede
// declarar el suyo con un comentario: <!-- Presupuesto: máximo N líneas -->
const DEFECTO = [
  [/^CLAUDE\.md$/, 80],
  [/^docs\/estado\.md$/, 40],
  [/^modules\/[^/]+\/CLAUDE\.md$/, 30],
  [/^\.claude\/rules\/.+\.md$/, 40],
  [/^\.claude\/agents\/.+\.md$/, 40],
  [/^\.claude\/skills\/[^/]+\/SKILL\.md$/, 60],
];

const leer = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const sinComentarios = (t) => t.replace(/<!--[\s\S]*?-->/g, '');
const lineas = (t) => sinComentarios(t).split('\n').filter((l) => l.trim() !== '').length;
const tokens = (t) => Math.ceil(sinComentarios(t).length / 4); // estimación gruesa
const frontmatter = (t) => (t.match(/^---\n([\s\S]*?)\n---/) || [null, ''])[1];

function recorrer(dir, salida = []) {
  if (!existsSync(dir)) return salida;
  for (const n of readdirSync(dir)) {
    if (IGNORAR.has(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) recorrer(p, salida);
    else if (n.endsWith('.md')) salida.push(p);
  }
  return salida;
}

const rel = (p) => relative(raiz, p).split('\\').join('/');
const archivos = recorrer(raiz).map((p) => ({ p, r: rel(p), t: leer(p) }));

function presupuesto({ r, t }) {
  const m = t.match(/Presupuesto:\s*máximo\s+(\d+)\s+líneas/i);
  if (m) return Number(m[1]);
  const d = DEFECTO.find(([re]) => re.test(r));
  return d ? d[1] : null;
}

// Contexto que se carga en cada sesión
let siempre = 0;
const detalleSiempre = [];
const raizClaude = archivos.find((a) => a.r === 'CLAUDE.md');
if (raizClaude) {
  siempre += tokens(raizClaude.t);
  detalleSiempre.push(['CLAUDE.md', tokens(raizClaude.t)]);
  for (const [, imp] of raizClaude.t.matchAll(/^@(\S+)/gm)) {
    const p = resolve(raiz, imp);
    if (existsSync(p)) {
      const k = tokens(leer(p));
      siempre += k;
      detalleSiempre.push([`  importado: ${imp}`, k]);
    }
  }
}
for (const a of archivos) {
  const fm = frontmatter(a.t);
  if (a.r.startsWith('.claude/rules/') && !/^paths:/m.test(fm)) {
    siempre += tokens(a.t);
    detalleSiempre.push([`regla sin paths: ${a.r}`, tokens(a.t)]);
  }
  if (/^\.claude\/(skills\/[^/]+\/SKILL|agents\/[^/]+)\.md$/.test(a.r)) {
    if (/disable-model-invocation:\s*true/.test(fm)) continue;
    const desc = (fm.match(/^description:\s*(.*)$/m) || [null, ''])[1];
    const k = Math.ceil(desc.length / 4);
    siempre += k;
    detalleSiempre.push([`descripción: ${a.r}`, k]);
  }
}

// Verificación de presupuestos
const excedidos = [];
console.log('\nArchivo'.padEnd(58) + 'Líneas  Máx');
for (const a of archivos) {
  const max = presupuesto(a);
  if (max === null) continue;
  const n = lineas(a.t);
  const marca = n > max ? '  ← EXCEDE' : '';
  if (n > max) excedidos.push(a.r);
  console.log(a.r.padEnd(57) + String(n).padStart(6) + String(max).padStart(5) + marca);
}

console.log('\nCargado en cada sesión (estimado):');
for (const [n, k] of detalleSiempre) console.log(`  ${n.padEnd(60)} ~${k} tokens`);
console.log(`  ${'TOTAL'.padEnd(60)} ~${siempre} tokens`);
const LIMITE_SIEMPRE = 2500;
if (siempre > LIMITE_SIEMPRE) excedidos.push(`contexto permanente > ${LIMITE_SIEMPRE} tokens`);

if (excedidos.length) {
  console.error(`\n✗ Fuera de presupuesto: ${excedidos.join(', ')}`);
  console.error('  Revisa docs/guia-contexto.md, sección "Dónde va cada cosa".');
  process.exit(1);
}
console.log('\n✓ Contexto dentro del presupuesto.');
