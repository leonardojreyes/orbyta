import { EmpresaRequeridaError } from '@orbyta/ping-domain';
import { HacerPing } from './hacer-ping';
import { RelojPort } from './reloj.port';

describe('HacerPing', () => {
  const instante = new Date('2026-10-01T12:00:00.000Z');
  const relojFijo: RelojPort = { ahora: () => instante };
  const hacerPing = new HacerPing(relojFijo);

  it('responde pong con la empresa y el instante del reloj', () => {
    expect(hacerPing.ejecutar({ empresaId: 'A' })).toEqual({
      mensaje: 'pong',
      empresaId: 'A',
      instante,
    });
  });

  it('no mezcla empresas entre pings consecutivos', () => {
    const a = hacerPing.ejecutar({ empresaId: 'A' });
    const b = hacerPing.ejecutar({ empresaId: 'B' });
    expect(a.empresaId).toBe('A');
    expect(b.empresaId).toBe('B');
  });

  it('es determinista con un reloj simulado fijo', () => {
    expect(hacerPing.ejecutar({ empresaId: 'A' })).toEqual(
      hacerPing.ejecutar({ empresaId: 'A' }),
    );
  });

  it('falla sin empresa', () => {
    expect(() => hacerPing.ejecutar({ empresaId: '' })).toThrow(
      EmpresaRequeridaError,
    );
  });
});
