import { crearPong, EmpresaRequeridaError } from './pong';

describe('crearPong', () => {
  const instante = new Date('2026-10-01T12:00:00.000Z');

  it('crea un Pong con mensaje, empresa e instante', () => {
    expect(crearPong('A', instante)).toEqual({
      mensaje: 'pong',
      empresaId: 'A',
      instante,
    });
  });

  it('recorta espacios del identificador de empresa', () => {
    expect(crearPong('  A  ', instante).empresaId).toBe('A');
  });

  it.each([null, undefined, '', '   '])('rechaza la empresa %p', (empresaId) => {
    expect(() => crearPong(empresaId, instante)).toThrow(EmpresaRequeridaError);
  });
});
