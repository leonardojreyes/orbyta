// Utilidades compartidas por los hooks. Solo Node, sin dependencias.
import { readFileSync } from 'node:fs';

export function leerEntrada() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

/** Bloquea la acción: el mensaje llega a Claude y el código 2 impide la ejecución. */
export function bloquear(mensaje) {
  process.stderr.write(`${mensaje}\n`);
  process.exit(2);
}
