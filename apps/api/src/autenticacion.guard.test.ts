import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenInvalidoError, type ValidadorToken } from '@orbyta/identidad';
import { describe, expect, it } from 'vitest';
import { AutenticacionGuard } from './autenticacion.guard';
import { contextoActual } from './contexto';

const IDENTIDAD = { usuarioId: 'u1', empresaId: '11111111-1111-1111-1111-111111111111', roles: ['admin'] };
const validador: ValidadorToken = {
  validar: async (t) => {
    if (t !== 'bueno') throw new TokenInvalidoError('firma');
    return IDENTIDAD;
  },
};

const contexto = (authorization?: string, publico = false) =>
  ({
    getHandler: () => (publico ? Object.assign(() => undefined, {}) : () => undefined),
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ headers: authorization ? { authorization } : {} }) }),
  }) as unknown as ExecutionContext;

const reflector = (publico: boolean) =>
  ({ getAllAndOverride: () => publico }) as unknown as Reflector;

describe('AutenticacionGuard', () => {
  it('deja pasar rutas públicas sin token', async () => {
    const guard = new AutenticacionGuard(reflector(true), validador);
    await expect(guard.canActivate(contexto())).resolves.toBe(true);
  });

  it('rechaza sin cabecera Authorization', async () => {
    const guard = new AutenticacionGuard(reflector(false), validador);
    await expect(guard.canActivate(contexto())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un token inválido', async () => {
    const guard = new AutenticacionGuard(reflector(false), validador);
    await expect(guard.canActivate(contexto('Bearer malo'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza si la identidad no está configurada', async () => {
    const guard = new AutenticacionGuard(reflector(false), undefined);
    await expect(guard.canActivate(contexto('Bearer bueno'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('con token válido fija la empresa en el contexto de la petición', async () => {
    const guard = new AutenticacionGuard(reflector(false), validador);
    await expect(guard.canActivate(contexto('Bearer bueno'))).resolves.toBe(true);
    expect(contextoActual()).toEqual(IDENTIDAD);
  });
});
