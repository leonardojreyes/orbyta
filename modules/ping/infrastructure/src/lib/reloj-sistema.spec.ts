import { RelojPort } from '@orbyta/ping-application';
import { RelojSistema } from './reloj-sistema';

describe('RelojSistema', () => {
  it('cumple el contrato de RelojPort', () => {
    const reloj: RelojPort = new RelojSistema();
    expect(reloj.ahora()).toBeInstanceOf(Date);
  });

  it('devuelve la hora actual del sistema', () => {
    const antes = Date.now();
    const ahora = new RelojSistema().ahora().getTime();
    const despues = Date.now();
    expect(ahora).toBeGreaterThanOrEqual(antes);
    expect(ahora).toBeLessThanOrEqual(despues);
  });
});
