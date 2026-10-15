import { AsyncLocalStorage } from 'node:async_hooks';
import type { IdentidadVerificada } from '@orbyta/identidad';

interface Contexto {
  requestId: string;
  identidad?: IdentidadVerificada;
}

const almacen = new AsyncLocalStorage<Contexto>();

/** Abre el contexto de una petición; todo lo que corra dentro comparte su `requestId` e identidad. */
export function iniciarPeticion<T>(requestId: string, trabajo: () => T): T {
  return almacen.run({ requestId }, trabajo);
}

/** Fija la identidad de la petición en curso. Falla fuera de una petición. */
export function fijarContexto(identidad: IdentidadVerificada): void {
  const contexto = almacen.getStore();
  if (!contexto) throw new Error('No hay petición en curso para fijar la identidad');
  contexto.identidad = identidad;
}

/** Identidad de la petición en curso; falla si no hay una (nunca se asume empresa). */
export function contextoActual(): IdentidadVerificada {
  const identidad = almacen.getStore()?.identidad;
  if (!identidad) throw new Error('No hay contexto de empresa en esta ejecución');
  return identidad;
}

export function requestIdActual(): string | null {
  return almacen.getStore()?.requestId ?? null;
}

/** Empresa de la petición en curso, o null fuera de una petición o antes de autenticar. */
export function empresaIdActual(): string | null {
  return almacen.getStore()?.identidad?.empresaId ?? null;
}

/** Ata un callback al contexto de la petición actual, aunque otro emisor lo invoque después. */
export function vincular<F extends (...argumentos: never[]) => unknown>(callback: F): F {
  return AsyncLocalStorage.bind(callback);
}
