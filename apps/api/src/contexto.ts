import { AsyncLocalStorage } from 'node:async_hooks';
import type { IdentidadVerificada } from '@orbyta/identidad';

const almacen = new AsyncLocalStorage<IdentidadVerificada>();

/** Fija la identidad de la petición en curso para todo lo que se ejecute después. */
export function fijarContexto(identidad: IdentidadVerificada): void {
  almacen.enterWith(identidad);
}

/** Identidad de la petición en curso; falla si no hay una (nunca se asume empresa). */
export function contextoActual(): IdentidadVerificada {
  const identidad = almacen.getStore();
  if (!identidad) throw new Error('No hay contexto de empresa en esta ejecución');
  return identidad;
}
