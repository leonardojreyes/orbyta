export class EmpresaRequeridaError extends Error {
  constructor() {
    super('La empresa es obligatoria');
    this.name = 'EmpresaRequeridaError';
  }
}

export interface Pong {
  readonly mensaje: 'pong';
  readonly empresaId: string;
  readonly instante: Date;
}

export const crearPong = (
  empresaId: string | null | undefined,
  instante: Date,
): Pong => {
  const empresa = empresaId?.trim();
  if (!empresa) {
    throw new EmpresaRequeridaError();
  }
  return { mensaje: 'pong', empresaId: empresa, instante };
};
