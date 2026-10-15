import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OAuth2Server } from 'oauth2-mock-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModulo } from '../app.modulo';
import { componer } from '../composicion';
import { cargarConfiguracion } from '../config/config';
import { middlewarePeticion } from '../peticion.middleware';

/** Mismos UUID que los atributos `empresa_id` de los usuarios en deploy/keycloak/orbyta-realm.json. */
const EMPRESA_A = '11111111-1111-4111-8111-111111111111';
const EMPRESA_B = '22222222-2222-4222-8222-222222222222';
const AUDIENCIA = 'orbyta-api';
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://orbyta_app:orbyta_app@localhost:5432/orbyta';
/** Si está definida, la prueba usa Keycloak real (CI); si no, oauth2-mock-server (perfil local). */
const KEYCLOAK_URL = process.env.OIDC_E2E_KEYCLOAK_URL;

interface Proveedor {
  entorno: Record<string, string>;
  token(empresaId: string, opciones?: { audiencia?: string }): Promise<string>;
  cerrar(): Promise<void>;
}

async function proveedorMock(): Promise<Proveedor> {
  const servidor = new OAuth2Server();
  await servidor.issuer.keys.generate('RS256');
  await servidor.start(0, 'localhost');
  const emisor = servidor.issuer.url as string;
  return {
    entorno: { OIDC_EMISOR: emisor, OIDC_AUDIENCIA: AUDIENCIA, OIDC_JWKS_URL: `${emisor}/jwks` },
    token: (empresaId, opciones) =>
      servidor.issuer.buildToken({
        scopesOrTransform: (_cabecera: unknown, carga: Record<string, unknown>) => {
          carga.sub = `usuario-${empresaId}`;
          carga.aud = opciones?.audiencia ?? AUDIENCIA;
          carga.empresa_id = empresaId;
          carga.roles = ['miembro'];
        },
      }),
    cerrar: () => servidor.stop(),
  };
}

async function proveedorKeycloak(url: string): Promise<Proveedor> {
  const emisor = `${url}/realms/orbyta`;
  const usuarios: Record<string, string> = {
    [EMPRESA_A]: 'ana@empresa-a.test',
    [EMPRESA_B]: 'beto@empresa-b.test',
  };
  return {
    entorno: {
      OIDC_EMISOR: emisor,
      OIDC_AUDIENCIA: AUDIENCIA,
      OIDC_JWKS_URL: `${emisor}/protocol/openid-connect/certs`,
    },
    token: async (empresaId) => {
      const respuesta = await fetch(`${emisor}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'orbyta-e2e',
          username: usuarios[empresaId] ?? '',
          password: 'prueba-ci-no-secreta',
        }),
      });
      if (!respuesta.ok)
        throw new Error(`Keycloak rechazó el inicio de sesión: ${respuesta.status}`);
      return ((await respuesta.json()) as { access_token: string }).access_token;
    },
    cerrar: async () => undefined,
  };
}

describe(`e2e dos empresas (${KEYCLOAK_URL ? 'Keycloak' : 'mock OIDC'})`, () => {
  let proveedor: Proveedor;
  let app: INestApplication;
  let cerrarRecursos: () => Promise<void>;

  beforeAll(async () => {
    proveedor = KEYCLOAK_URL ? await proveedorKeycloak(KEYCLOAK_URL) : await proveedorMock();
    const config = cargarConfiguracion({
      PERFIL: 'local',
      DATABASE_URL,
      ...proveedor.entorno,
    });
    const { ejecutor, validador, casosDeUso } = componer(config);
    const modulo = await Test.createTestingModule({
      imports: [AppModulo.con(validador, casosDeUso)],
    }).compile();
    app = modulo.createNestApplication();
    app.use(middlewarePeticion);
    await app.init();
    cerrarRecursos = async () => {
      await app.close();
      await ejecutor.cerrar();
      await proveedor.cerrar();
    };
  });

  afterAll(async () => {
    await cerrarRecursos?.();
  });

  const servidor = () => app.getHttpServer();

  it('rechaza sin token', async () => {
    await request(servidor()).get('/notas').expect(401);
  });

  it('cada empresa solo ve sus propias notas', async () => {
    const tokenA = await proveedor.token(EMPRESA_A);
    const tokenB = await proveedor.token(EMPRESA_B);
    const tituloA = `nota-a-${randomUUID()}`;
    const tituloB = `nota-b-${randomUUID()}`;

    await request(servidor())
      .post('/notas')
      .set('authorization', `Bearer ${tokenA}`)
      .send({ titulo: tituloA })
      .expect(201);
    await request(servidor())
      .post('/notas')
      .set('authorization', `Bearer ${tokenB}`)
      .send({ titulo: tituloB })
      .expect(201);

    const deA = await request(servidor())
      .get('/notas')
      .set('authorization', `Bearer ${tokenA}`)
      .expect(200);
    const deB = await request(servidor())
      .get('/notas')
      .set('authorization', `Bearer ${tokenB}`)
      .expect(200);
    const titulosA = (deA.body as { titulo: string }[]).map((n) => n.titulo);
    const titulosB = (deB.body as { titulo: string }[]).map((n) => n.titulo);

    expect(titulosA).toContain(tituloA);
    expect(titulosA).not.toContain(tituloB);
    expect(titulosB).toContain(tituloB);
    expect(titulosB).not.toContain(tituloA);
  });

  it.skipIf(Boolean(KEYCLOAK_URL))('rechaza un token con audiencia ajena', async () => {
    const token = await proveedor.token(EMPRESA_A, { audiencia: 'otra-api' });
    await request(servidor()).get('/notas').set('authorization', `Bearer ${token}`).expect(401);
  });
});
