// PreToolUse (Edit|Write): bloquea .env*, migraciones aplicadas e infra/ de producción.
import fs from 'node:fs';
import path from 'node:path';
import { block, isMain, readInput, relPath, root } from './lib.mjs';

export const checkEdit = (file) => {
  const rel = relPath(file);
  const base = path.posix.basename(rel);
  if (/^\.env(\..*)?$/.test(base) && base !== '.env.example') {
    return `no se editan archivos .env* (${rel}). Usa .env.example y el gestor de secretos.`;
  }
  if (/(^|\/)migrations?\//.test(rel) && fs.existsSync(path.resolve(root, rel))) {
    return `${rel} es una migración existente (ya aplicada). Crea una migración nueva en su lugar.`;
  }
  if (/^infra\/.*(prod|production|produccion)/i.test(rel)) {
    return `${rel} es infraestructura de producción; requiere cambio manual aprobado.`;
  }
  return null;
};

if (isMain(import.meta.url)) {
  const input = await readInput();
  const file = input.tool_input?.file_path;
  const reason = file ? checkEdit(file) : null;
  if (reason) block(reason);
}
