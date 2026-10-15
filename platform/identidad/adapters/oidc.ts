import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { TokenInvalidoError, type IdentidadVerificada, type ValidadorToken } from '../port';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface OpcionesOidc {
  emisor: string;
  audiencia: string;
  /** Resolutor de claves públicas (JWKS remoto o fijo en pruebas). */
  claves: JWTVerifyGetKey;
  /** Claim con la empresa. Por defecto `empresa_id`. */
  claimEmpresa?: string;
  /** Claim con los roles. Por defecto `roles`. */
  claimRoles?: string;
}

export function clavesDesdeJwks(url: string): JWTVerifyGetKey {
  return createRemoteJWKSet(new URL(url));
}

export class ValidadorTokenOidc implements ValidadorToken {
  constructor(private readonly opciones: OpcionesOidc) {}

  async validar(token: string): Promise<IdentidadVerificada> {
    const { emisor, audiencia, claves, claimEmpresa = 'empresa_id', claimRoles = 'roles' } = this.opciones;
    let payload;
    try {
      ({ payload } = await jwtVerify(token, claves, {
        issuer: emisor,
        audience: audiencia,
        algorithms: ['RS256', 'ES256'],
      }));
    } catch (error) {
      throw new TokenInvalidoError(error instanceof Error ? error.name : 'desconocido');
    }
    const empresaId = payload[claimEmpresa];
    if (typeof empresaId !== 'string' || !UUID.test(empresaId)) {
      throw new TokenInvalidoError('empresa ausente o inválida');
    }
    if (!payload.sub) throw new TokenInvalidoError('sin sujeto');
    const roles = payload[claimRoles];
    return {
      usuarioId: payload.sub,
      empresaId,
      roles: Array.isArray(roles) ? roles.filter((r): r is string => typeof r === 'string') : [],
    };
  }
}
