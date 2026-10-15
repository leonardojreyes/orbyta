import type { LoggerService } from '@nestjs/common';
import { empresaIdActual, requestIdActual } from './contexto';

export type Nivel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Una línea JSON. `empresaId` y `requestId` siempre están presentes (null fuera de una petición) y
 * no pueden ser sobrescritos por `extra`. No pases datos personales ni secretos en `extra`.
 */
export function formatear(nivel: Nivel, mensaje: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    ...extra,
    fecha: new Date().toISOString(),
    nivel,
    mensaje,
    empresaId: empresaIdActual(),
    requestId: requestIdActual(),
  });
}

export function registrar(nivel: Nivel, mensaje: string, extra?: Record<string, unknown>): void {
  const salida = nivel === 'error' || nivel === 'warn' ? process.stderr : process.stdout;
  salida.write(`${formatear(nivel, mensaje, extra)}\n`);
}

const texto = (m: unknown): string => (typeof m === 'string' ? m : JSON.stringify(m));

/** Logger de Nest que emite JSON con el mismo formato. */
export class LoggerJson implements LoggerService {
  log(mensaje: unknown) {
    registrar('info', texto(mensaje));
  }
  warn(mensaje: unknown) {
    registrar('warn', texto(mensaje));
  }
  error(mensaje: unknown) {
    registrar('error', texto(mensaje));
  }
  debug(mensaje: unknown) {
    registrar('debug', texto(mensaje));
  }
  verbose(mensaje: unknown) {
    registrar('debug', texto(mensaje));
  }
}
