// Utilidades compartidas por los hooks de Claude Code (Node, multiplataforma).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(import.meta.dirname, '..', '..');

export const readInput = async () => {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
};

// Ruta relativa a la raíz del repo, con separadores "/" en cualquier SO.
export const relPath = (file) =>
  path.relative(root, path.resolve(root, file)).split(path.sep).join('/');

// Exit 2 = bloquear; el stderr se devuelve a Claude.
export const block = (message) => {
  process.stderr.write(`[hook] BLOQUEADO: ${message}\n`);
  process.exit(2);
};

// true cuando el archivo se ejecuta directamente (no al importarlo desde las pruebas).
export const isMain = (metaUrl) =>
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(metaUrl);
