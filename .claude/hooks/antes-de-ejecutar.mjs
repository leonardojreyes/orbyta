#!/usr/bin/env node
// PreToolUse (Bash): bloquea comandos destructivos y commits a main.
import { spawnSync } from 'node:child_process';
import { bloquear, leerEntrada } from './util.mjs';

const cmd = leerEntrada().tool_input?.command ?? '';

const PELIGROSOS = [
  [/\brm\s+(-[a-zA-Z]*[rR][a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*[rR])\s+(\/|~|\$HOME|\.\.|\*)(\s|$)/, 'rm -rf sobre una ruta amplia'],
  [/\bgit\s+push\b.*(--force\b|-f\b)/, 'git push --force'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard'],
  [/\bgit\s+clean\s+-[a-zA-Z]*f/, 'git clean -f'],
  [/\bgit\s+push\b.*\b(origin\s+)?main\b/, 'push directo a main'],
  [/\bdrop\s+(database|schema)\b/i, 'DROP DATABASE/SCHEMA'],
  [/\bmkfs\b|\bdd\s+if=/, 'operación de disco'],
  [/:\(\)\s*\{.*\};\s*:/, 'fork bomb'],
];
for (const [patron, nombre] of PELIGROSOS) {
  if (patron.test(cmd)) bloquear(`Bloqueado (${nombre}). Pide aprobación explícita al usuario.`);
}

if (/\bgit\s+commit\b/.test(cmd)) {
  const rama = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout.trim();
  if (rama === 'main') bloquear('Bloqueado: no se hacen commits a main. Usa una rama de trabajo.');
}
