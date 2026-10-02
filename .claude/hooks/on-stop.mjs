// Stop: pruebas afectadas y escaneo de secretos. Si fallan, Claude continúa y corrige.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readInput, root } from './lib.mjs';

const input = await readInput();
if (input.stop_hook_active) process.exit(0); // evita bucles

const sh = (cmd, args) =>
  spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });

const problems = [];

// 1) Escaneo de secretos: gitleaks si existe; si no, patrones sobre los archivos modificados.
const gl = sh('gitleaks', ['detect', '--no-banner', '--redact']);
if (gl.error) {
  const changed = sh('git', ['status', '--porcelain']).stdout
    .split('\n')
    .map((l) => l.slice(3).trim())
    .filter((f) => f && fs.existsSync(`${root}/${f}`) && fs.statSync(`${root}/${f}`).isFile());
  const patterns = [
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /gh[pousr]_[A-Za-z0-9]{36,}/,
    /(secret|password|passwd|token|api[_-]?key)\s*[:=]\s*['"][^'"\s]{12,}['"]/i,
  ];
  for (const f of changed) {
    if (/\.(spec|test)\.|\.example$|\.lock$|pnpm-lock/.test(f)) continue;
    const text = fs.readFileSync(`${root}/${f}`, 'utf8');
    if (patterns.some((p) => p.test(text))) problems.push(`posible secreto en ${f}`);
  }
} else if (gl.status !== 0) {
  problems.push(`gitleaks detectó secretos:\n${gl.stdout}${gl.stderr}`);
}

// 2) Pruebas afectadas.
const t = sh('pnpm', ['exec', 'nx', 'affected', '-t', 'test', '--base=HEAD']);
if (t.status !== 0) problems.push(`nx affected -t test falló:\n${t.stdout.slice(-3000)}${t.stderr.slice(-1000)}`);

if (problems.length) {
  process.stderr.write(`[hook] Stop bloqueado:\n${problems.join('\n')}\n`);
  process.exit(2);
}
