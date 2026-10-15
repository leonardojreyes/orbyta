import { SignJWT, generateKeyPair, type JWTPayload } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { TokenInvalidoError, type ValidadorToken } from './port';
import { ValidadorTokenOidc } from './adapters/oidc';

const EMISOR = 'https://identidad.orbyta.test';
const AUDIENCIA = 'orbyta-api';
const EMPRESA = '11111111-1111-1111-1111-111111111111';

type Par = Awaited<ReturnType<typeof generateKeyPair>>;
let confiable: Par;
let ajena: Par;

const firmar = (par: Par, payload: JWTPayload, opciones: { exp?: string; emisor?: string } = {}) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuer(opciones.emisor ?? EMISOR)
    .setAudience(AUDIENCIA)
    .setSubject('usuario-1')
    .setIssuedAt()
    .setExpirationTime(opciones.exp ?? '5m')
    .sign(par.privateKey);

// Todo adaptador de ValidadorToken, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => ValidadorToken]> = [
  [
    'oidc',
    () =>
      new ValidadorTokenOidc({ emisor: EMISOR, audiencia: AUDIENCIA, claves: async () => confiable.publicKey }),
  ],
];

describe.each(adaptadores)('contrato ValidadorToken — %s', (_nombre, crear) => {
  beforeAll(async () => {
    confiable = await generateKeyPair('ES256');
    ajena = await generateKeyPair('ES256');
  });

  it('devuelve usuario, empresa y roles de un token válido', async () => {
    const token = await firmar(confiable, { empresa_id: EMPRESA, roles: ['admin'] });
    await expect(crear().validar(token)).resolves.toEqual({
      usuarioId: 'usuario-1',
      empresaId: EMPRESA,
      roles: ['admin'],
    });
  });

  it('rechaza un token expirado', async () => {
    const token = await firmar(confiable, { empresa_id: EMPRESA }, { exp: '-1m' });
    await expect(crear().validar(token)).rejects.toBeInstanceOf(TokenInvalidoError);
  });

  it('rechaza una firma de otra clave', async () => {
    const token = await firmar(ajena, { empresa_id: EMPRESA });
    await expect(crear().validar(token)).rejects.toBeInstanceOf(TokenInvalidoError);
  });

  it('rechaza un emisor distinto', async () => {
    const token = await firmar(confiable, { empresa_id: EMPRESA }, { emisor: 'https://otro.test' });
    await expect(crear().validar(token)).rejects.toBeInstanceOf(TokenInvalidoError);
  });

  it('rechaza un token sin empresa o con empresa que no es UUID', async () => {
    const sinEmpresa = await firmar(confiable, {});
    const mala = await firmar(confiable, { empresa_id: 'no-es-uuid' });
    await expect(crear().validar(sinEmpresa)).rejects.toBeInstanceOf(TokenInvalidoError);
    await expect(crear().validar(mala)).rejects.toBeInstanceOf(TokenInvalidoError);
  });

  it('rechaza basura que no es un JWT', async () => {
    await expect(crear().validar('abc')).rejects.toBeInstanceOf(TokenInvalidoError);
  });
});
