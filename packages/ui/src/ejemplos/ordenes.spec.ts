import {
  estadoVisible,
  formatearFecha,
  ordenesEjemplo,
  resumenEjemplo,
} from './ordenes';

describe('datos de ejemplo', () => {
  it('formatea fechas como dd/mm/aaaa', () => {
    expect(formatearFecha('2026-10-05')).toBe('05/10/2026');
  });

  it('el plazo en riesgo o vencido gana al estado, salvo en órdenes cerradas', () => {
    expect(estadoVisible({ estado: 'en_curso', plazo: 'en_riesgo' })).toBe(
      'en_riesgo',
    );
    expect(estadoVisible({ estado: 'registrada', plazo: 'vencida' })).toBe(
      'vencida',
    );
    expect(estadoVisible({ estado: 'cerrada', plazo: 'vencida' })).toBe(
      'cerrada',
    );
    expect(estadoVisible({ estado: 'registrada', plazo: 'ok' })).toBe(
      'registrada',
    );
  });

  it('resume las órdenes de ejemplo', () => {
    const r = resumenEjemplo(ordenesEjemplo);
    expect(r.total).toBe(5);
    expect(r.registrada + r.en_curso + r.cerrada).toBe(r.total);
    expect(r.enRiesgo).toBe(1);
    expect(r.vencidas).toBe(1);
  });

  it('no incluye datos personales reales (solo identificadores genéricos)', () => {
    expect(ordenesEjemplo.every((o) => /^Abonado \d{4}$/.test(o.abonado))).toBe(
      true,
    );
  });
});
