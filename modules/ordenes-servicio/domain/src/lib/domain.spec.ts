import { EstadoOrdenServicio } from './domain';

describe('EstadoOrdenServicio', () => {
  it('tiene los tres estados del esqueleto de Fase 0', () => {
    expect(Object.values(EstadoOrdenServicio)).toEqual([
      'registrada',
      'en_curso',
      'cerrada_x',
    ]);
  });
});
