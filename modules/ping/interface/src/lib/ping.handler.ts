import { HacerPing, HacerPingEntrada } from '@orbyta/ping-application';
import { EmpresaRequeridaError } from '@orbyta/ping-domain';

export class PeticionInvalidaError extends Error {
  constructor() {
    super('La petición no es válida');
    this.name = 'PeticionInvalidaError';
  }
}

export interface PingRespuesta {
  readonly mensaje: string;
  readonly empresaId: string;
  readonly instante: string;
}

export const manejarPing = (
  hacerPing: HacerPing,
  entrada: HacerPingEntrada,
): PingRespuesta => {
  try {
    const { mensaje, empresaId, instante } = hacerPing.ejecutar(entrada);
    return { mensaje, empresaId, instante: instante.toISOString() };
  } catch (error) {
    if (error instanceof EmpresaRequeridaError) {
      throw new PeticionInvalidaError();
    }
    throw error;
  }
};
