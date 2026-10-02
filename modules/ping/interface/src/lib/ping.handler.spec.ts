import { HacerPing } from '@orbyta/ping-application';
import { manejarPing, PeticionInvalidaError } from './ping.handler';

describe('manejarPing', () => {
  const instante = new Date('2026-10-01T12:00:00.000Z');
  const hacerPing = new HacerPing({ ahora: () => instante });

  it('responde con el instante en ISO 8601', () => {
    expect(manejarPing(hacerPing, { empresaId: 'A' })).toEqual({
      mensaje: 'pong',
      empresaId: 'A',
      instante: '2026-10-01T12:00:00.000Z',
    });
  });

  it('traduce la empresa ausente a PeticionInvalidaError sin detalles internos', () => {
    const llamada = () => manejarPing(hacerPing, { empresaId: '  ' });
    expect(llamada).toThrow(PeticionInvalidaError);
    expect(llamada).toThrow('La petición no es válida');
  });
});
