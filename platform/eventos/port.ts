import type { Transaccion } from '@orbyta/tenancy';

/**
 * Cola de tareas en segundo plano, separadas por empresa. Cada tarea viaja con su `empresaId` y el
 * manejador la recibe ya acotada a esa empresa. La carga lleva identificadores, nunca datos
 * personales: las tablas de la cola no tienen RLS.
 */
export interface ColaTareas {
  /**
   * Encola dentro de la transacción del negocio (outbox transaccional): si la transacción se
   * revierte, la tarea no existe; si se confirma, existe.
   */
  encolar(tx: Transaccion, empresaId: string, cola: string, carga: unknown): Promise<void>;
  /** Registra el manejador de una cola. Lanzar un error marca la tarea como fallida. */
  trabajar(cola: string, manejador: (empresaId: string, carga: unknown) => Promise<void>): Promise<void>;
  cerrar(): Promise<void>;
}

export class TareaInvalidaError extends Error {
  constructor(motivo: string) {
    super(`Tarea inválida: ${motivo}`);
    this.name = 'TareaInvalidaError';
  }
}
