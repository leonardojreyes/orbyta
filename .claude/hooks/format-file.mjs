// PostToolUse (Edit|Write): formatea y aplica lint al archivo tocado.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readInput, relPath, root } from './lib.mjs';

const input = await readInput();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);
const rel = relPath(file);
if (rel.startsWith('..') || !fs.existsSync(file)) process.exit(0);

const run = (args) =>
  spawnSync('pnpm', ['exec', ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

if (/\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|ya?ml)$/.test(rel)) {
  run(['prettier', '--write', rel]);
}
if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel)) {
  const lint = run(['eslint', rel]);
  if (lint.status !== 0) {
    // Exit 2 en PostToolUse devuelve el error a Claude para que lo corrija.
    process.stderr.write(`[hook] lint falló en ${rel}:\n${lint.stdout}${lint.stderr}\n`);
    process.exit(2);
  }
}
