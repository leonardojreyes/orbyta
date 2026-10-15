#!/usr/bin/env node
// PostToolUse (Edit|Write): Prettier y ESLint solo del archivo tocado.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { bloquear, leerEntrada } from './util.mjs';

const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const ruta = leerEntrada().tool_input?.file_path ?? '';
if (!ruta || !existsSync(ruta) || ruta.includes('node_modules')) process.exit(0);

const ext = extname(ruta);
const bin = (n) => join(raiz, 'node_modules', '.bin', n);
if (!existsSync(bin('prettier'))) process.exit(0); // dependencias aún sin instalar

if (['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css', '.html', '.yaml', '.yml'].includes(ext)) {
  spawnSync(bin('prettier'), ['--write', '--log-level', 'silent', ruta], { cwd: raiz });
}
if (['.ts', '.tsx', '.js', '.mjs', '.cjs'].includes(ext)) {
  const r = spawnSync(bin('eslint'), ['--fix', ruta], { cwd: raiz, encoding: 'utf8' });
  if (r.status !== 0) bloquear(`ESLint encontró problemas en ${ruta}:\n${r.stdout}${r.stderr}`);
}
