import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// El documento OpenAPI parseado es dinámico; se acota a este único alias.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Nodo = any;
type Obj = Record<string, Nodo>;

const documento: Obj = parse(readFileSync(join(__dirname, 'openapi.yaml'), 'utf8'));

const resolverRef = (ref: string): Obj => {
  if (!ref.startsWith('#/')) throw new Error(`Solo se admiten $ref locales: ${ref}`);
  let actual: Nodo = documento;
  for (const parte of ref.slice(2).split('/')) {
    actual = actual?.[parte.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  if (actual === undefined) throw new Error(`$ref sin resolver: ${ref}`);
  return actual;
};

const resolver = (nodo: Nodo): Nodo => {
  let actual = nodo;
  while (actual && typeof actual === 'object' && typeof actual.$ref === 'string') {
    actual = resolverRef(actual.$ref);
  }
  return actual;
};

const METODOS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const RUTAS_MARCA = ['/marca', '/marca/logo'];

const ruta = (r: string): Obj => documento.paths?.[r] ?? {};
const operacion = (r: string): Obj => ruta(r).get ?? {};
const respuesta = (r: string, codigo: string): Obj | undefined =>
  resolver(operacion(r).responses?.[codigo]);
const esquemaDe = (r: string, codigo: string, tipo: string): Obj | undefined =>
  resolver(respuesta(r, codigo)?.content?.[tipo]?.schema);

describe('contrato OpenAPI de marca', () => {
  it('mantiene la ruta /salud', () => {
    expect(documento.paths).toHaveProperty('/salud');
  });

  it('define GET /marca y GET /marca/logo', () => {
    expect(documento.paths).toHaveProperty(['/marca']);
    expect(documento.paths).toHaveProperty(['/marca/logo']);
    expect(ruta('/marca').get).toBeDefined();
    expect(ruta('/marca/logo').get).toBeDefined();
  });

  it.each(RUTAS_MARCA)('%s no admite métodos de escritura', (r) => {
    const metodos = Object.keys(ruta(r)).filter((k) => METODOS.includes(k));
    expect(metodos).toEqual(['get']);
  });

  describe('GET /marca', () => {
    it('responde 200 application/json con colorPrimario y tieneLogo requeridos', () => {
      const esquema = esquemaDe('/marca', '200', 'application/json');
      expect(esquema).toBeDefined();
      expect(esquema?.type).toBe('object');
      expect(esquema?.required).toEqual(expect.arrayContaining(['colorPrimario', 'tieneLogo']));
    });

    it('tipa colorPrimario como string con patrón #RRGGBB', () => {
      const color = resolver(
        esquemaDe('/marca', '200', 'application/json')?.properties?.colorPrimario,
      );
      expect(color?.type).toBe('string');
      expect(typeof color?.pattern).toBe('string');
      const patron = new RegExp(color.pattern);
      expect(patron.test('#1A2b3C')).toBe(true);
      expect(patron.test('#FFF')).toBe(false);
      expect(patron.test('1A2B3C')).toBe(false);
      expect(patron.test('#1A2B3G')).toBe(false);
      expect(patron.test('#1A2B3C4')).toBe(false);
    });

    it('tipa tieneLogo como boolean', () => {
      const tiene = resolver(esquemaDe('/marca', '200', 'application/json')?.properties?.tieneLogo);
      expect(tiene?.type).toBe('boolean');
    });

    it.each(['401', '403'])('declara la respuesta %s', (codigo) => {
      expect(respuesta('/marca', codigo)).toBeDefined();
    });
  });

  describe('GET /marca/logo', () => {
    it('responde 200 con image/png como string binary', () => {
      const esquema = esquemaDe('/marca/logo', '200', 'image/png');
      expect(esquema).toBeDefined();
      expect(esquema?.type).toBe('string');
      expect(esquema?.format).toBe('binary');
    });

    it.each(['401', '403', '404'])('declara la respuesta %s', (codigo) => {
      expect(respuesta('/marca/logo', codigo)).toBeDefined();
    });
  });

  describe('errores en Problem Details (RFC 9457)', () => {
    const casos: Array<[string, string]> = [
      ['/marca', '401'],
      ['/marca', '403'],
      ['/marca/logo', '401'],
      ['/marca/logo', '403'],
      ['/marca/logo', '404'],
    ];

    it.each(casos)('%s %s usa application/problem+json con ProblemDetails', (r, codigo) => {
      const contenido = respuesta(r, codigo)?.content;
      expect(contenido).toBeDefined();
      expect(Object.keys(contenido ?? {})).toEqual(['application/problem+json']);
      const bruto = contenido['application/problem+json'].schema;
      expect(resolver(bruto)).toBe(documento.components?.schemas?.ProblemDetails);
    });

    it('ProblemDetails define type, title y status', () => {
      const pd = documento.components?.schemas?.ProblemDetails;
      expect(pd).toBeDefined();
      expect(Object.keys(pd?.properties ?? {})).toEqual(
        expect.arrayContaining(['type', 'title', 'status']),
      );
    });
  });

  describe('la empresa sale de la identidad', () => {
    it.each(RUTAS_MARCA)('%s no declara parámetros ni requestBody', (r) => {
      const op = operacion(r);
      const parametros = [...(ruta(r).parameters ?? []), ...(op.parameters ?? [])].map(resolver);
      expect(parametros).toEqual([]);
      expect(op.requestBody).toBeUndefined();
      expect(ruta(r).requestBody).toBeUndefined();
    });

    it.each(RUTAS_MARCA)('%s no menciona empresaId ni empresa_id como parámetro', (r) => {
      const nombres = [...(ruta(r).parameters ?? []), ...(operacion(r).parameters ?? [])]
        .map((p) => resolver(p)?.name)
        .filter(Boolean);
      expect(nombres).not.toContain('empresaId');
      expect(nombres).not.toContain('empresa_id');
    });
  });

  describe('seguridad bearer', () => {
    it('define el esquema http bearer JWT', () => {
      const esquema =
        documento.components?.securitySchemes?.[
          Object.keys(documento.components?.securitySchemes ?? {}).find((k) => {
            const s = documento.components.securitySchemes[k];
            return s.type === 'http' && s.scheme === 'bearer';
          }) ?? ''
        ];
      expect(esquema).toBeDefined();
      expect(esquema.bearerFormat).toBe('JWT');
    });

    it.each(RUTAS_MARCA)('%s exige seguridad bearer', (r) => {
      const esquemas: Obj = documento.components?.securitySchemes ?? {};
      const requisitos: Obj[] = operacion(r).security ?? documento.security ?? [];
      const nombres = requisitos.flatMap((req) => Object.keys(req));
      expect(nombres.length).toBeGreaterThan(0);
      expect(
        nombres.some((n) => esquemas[n]?.type === 'http' && esquemas[n]?.scheme === 'bearer'),
      ).toBe(true);
    });
  });
});
