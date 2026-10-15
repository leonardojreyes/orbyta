import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { SolicitudIAInvalidaError, type ModeloIA } from './port';
import { ModeloIASimulado } from './adapters/simulado';

// Todo adaptador de ModeloIA, actual o futuro (Anthropic), debe pasar este contrato.
const adaptadores: Array<[string, () => ModeloIA]> = [['simulado', () => new ModeloIASimulado()]];

describe.each(adaptadores)('contrato ModeloIA — %s', (_nombre, crear) => {
  it('responde con texto y modelo', async () => {
    const r = await crear().completar(randomUUID(), [{ rol: 'usuario', contenido: 'hola' }]);
    expect(r.texto.length).toBeGreaterThan(0);
    expect(r.modelo.length).toBeGreaterThan(0);
  });

  it('rechaza una empresa que no es UUID', async () => {
    await expect(
      crear().completar('no-es-uuid', [{ rol: 'usuario', contenido: 'hola' }]),
    ).rejects.toBeInstanceOf(SolicitudIAInvalidaError);
  });

  it('rechaza una solicitud sin mensaje de usuario', async () => {
    await expect(crear().completar(randomUUID(), [])).rejects.toBeInstanceOf(SolicitudIAInvalidaError);
    await expect(
      crear().completar(randomUUID(), [{ rol: 'usuario', contenido: '   ' }]),
    ).rejects.toBeInstanceOf(SolicitudIAInvalidaError);
  });
});
