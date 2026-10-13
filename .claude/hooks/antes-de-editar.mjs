#!/usr/bin/env node
// PreToolUse (Edit|Write): bloquea .env* (salvo .env.example) y migraciones ya versionadas.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { bloquear, leerEntrada } from './util.mjs';

const ruta = leerEntrada().tool_input?.file_path ?? '';
const nombre = basename(ruta);

if (/^\.env(\..+)?$/.test(nombre) && nombre !== '.env.example') {
  bloquear(`Bloqueado: ${nombre} contiene secretos. Edítalo tú; Claude solo puede tocar .env.example.`);
}

if (/[\\/]migrations[\\/]/.test(ruta) && existsSync(ruta)) {
  const versionada = spawnSync('git', ['ls-files', '--error-unmatch', ruta], { stdio: 'ignore' }).status === 0;
  const aplicada = process.env.CLAUDE_MIGRACION_APLICADA === '1';
  if (versionada || aplicada) {
    bloquear('Bloqueado: no edites una migración ya versionada o aplicada. Crea una migración nueva.');
  }
}
