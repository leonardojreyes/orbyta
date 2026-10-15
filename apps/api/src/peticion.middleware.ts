import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { iniciarPeticion, vincular } from './contexto';
import { registrar } from './logger';

/** Asigna un `requestId` a cada petición, lo devuelve en `x-request-id` y registra su resultado. */
export function middlewarePeticion(peticion: IncomingMessage, respuesta: ServerResponse, siguiente: () => void): void {
  const requestId = randomUUID();
  const inicio = Date.now();
  respuesta.setHeader('x-request-id', requestId);
  iniciarPeticion(requestId, () => {
    // Vinculado al contexto: al terminar, la línea lleva la empresa si la petición se autenticó.
    respuesta.on(
      'finish',
      vincular(() => {
        registrar('info', 'petición', {
          metodo: peticion.method,
          ruta: (peticion.url ?? '').split('?')[0],
          estado: respuesta.statusCode,
          duracionMs: Date.now() - inicio,
        });
      }),
    );
    siguiente();
  });
}
