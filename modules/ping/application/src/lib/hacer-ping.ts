import { crearPong, Pong } from '@orbyta/ping-domain';
import { RelojPort } from './reloj.port';

export interface HacerPingEntrada {
  readonly empresaId: string | null | undefined;
}

export class HacerPing {
  constructor(private readonly reloj: RelojPort) {}

  ejecutar({ empresaId }: HacerPingEntrada): Pong {
    return crearPong(empresaId, this.reloj.ahora());
  }
}
