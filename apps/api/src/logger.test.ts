import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextoActual, fijarContexto, iniciarPeticion } from './contexto';
import { formatear, registrar } from './logger';
import { middlewarePeticion } from './peticion.middleware';

const IDENTIDAD = { usuarioId: 'u1', empresaId: '11111111-1111-1111-1111-111111111111', roles: [] };

afterEach(() => vi.restoreAllMocks());

describe('formatear', () => {
  it('siempre trae empresaId y requestId, en null fuera de una petición', () => {
    const linea = JSON.parse(formatear('info', 'arranque'));
    expect(linea).toMatchObject({ nivel: 'info', mensaje: 'arranque', empresaId: null, requestId: null });
    expect(typeof linea.fecha).toBe('string');
  });

  it('toma la empresa y el requestId de la petición en curso', () => {
    iniciarPeticion('req-1', () => {
      fijarContexto(IDENTIDAD);
      const linea = JSON.parse(formatear('warn', 'algo'));
      expect(linea).toMatchObject({ empresaId: IDENTIDAD.empresaId, requestId: 'req-1' });
    });
  });

  it('extra no puede sobrescribir empresaId ni requestId', () => {
    iniciarPeticion('req-2', () => {
      const linea = JSON.parse(formatear('info', 'x', { empresaId: 'falsa', requestId: 'falso', otro: 1 }));
      expect(linea).toMatchObject({ empresaId: null, requestId: 'req-2', otro: 1 });
    });
  });
});

describe('contexto', () => {
  it('dos peticiones simultáneas no mezclan empresas', async () => {
    const otra = { ...IDENTIDAD, empresaId: '22222222-2222-2222-2222-222222222222' };
    const correr = (id: string, identidad: typeof IDENTIDAD) =>
      iniciarPeticion(id, async () => {
        fijarContexto(identidad);
        await new Promise((r) => setTimeout(r, 5));
        return contextoActual().empresaId;
      });
    const [a, b] = await Promise.all([correr('a', IDENTIDAD), correr('b', otra)]);
    expect([a, b]).toEqual([IDENTIDAD.empresaId, otra.empresaId]);
  });

  it('fijar identidad fuera de una petición falla', () => {
    expect(() => fijarContexto(IDENTIDAD)).toThrow();
  });
});

describe('middlewarePeticion', () => {
  it('asigna requestId, lo devuelve en la cabecera y registra la petición con la empresa', () => {
    const escribir = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const cabeceras: Record<string, string> = {};
    const respuesta = Object.assign(new EventEmitter(), {
      statusCode: 200,
      setHeader: (k: string, v: string) => (cabeceras[k] = v),
    }) as unknown as ServerResponse;
    const peticion = { method: 'GET', url: '/notas?q=secreto' } as IncomingMessage;

    middlewarePeticion(peticion, respuesta, () => fijarContexto(IDENTIDAD));
    respuesta.emit('finish');

    const linea = JSON.parse(String(escribir.mock.calls[0][0]));
    expect(linea).toMatchObject({
      mensaje: 'petición',
      metodo: 'GET',
      ruta: '/notas',
      estado: 200,
      empresaId: IDENTIDAD.empresaId,
      requestId: cabeceras['x-request-id'],
    });
    expect(JSON.stringify(linea)).not.toContain('secreto');
  });
});

describe('registrar', () => {
  it('escribe una línea JSON terminada en salto de línea', () => {
    const escribir = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    registrar('info', 'hola');
    const salida = String(escribir.mock.calls[0][0]);
    expect(salida.endsWith('\n')).toBe(true);
    expect(JSON.parse(salida).mensaje).toBe('hola');
  });
});
