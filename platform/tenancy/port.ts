export interface Transaccion {
  consultar<T = Record<string, unknown>>(sql: string, parametros?: unknown[]): Promise<T[]>;
}

/** Ejecuta trabajo dentro de una transacción con la empresa fijada. Sin empresa válida, falla. */
export interface EjecutorEmpresa {
  ejecutar<T>(empresaId: string, trabajo: (tx: Transaccion) => Promise<T>): Promise<T>;
  cerrar(): Promise<void>;
}

export class EmpresaRequeridaError extends Error {
  constructor() {
    super('Se requiere una empresa válida para ejecutar la consulta');
    this.name = 'EmpresaRequeridaError';
  }
}
