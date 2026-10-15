import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { IdentidadVerificada, ValidadorToken } from '@orbyta/identidad';
import { fijarContexto } from './contexto';

const CLAVE_PUBLICO = 'publico';
/** Marca una ruta como accesible sin token. Todo lo demás exige identidad. */
export const Publico = () => SetMetadata(CLAVE_PUBLICO, true);

interface PeticionHttp {
  headers: Record<string, string | string[] | undefined>;
  identidad?: IdentidadVerificada;
}

@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly validador: ValidadorToken | undefined,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const publico = this.reflector.getAllAndOverride<boolean>(CLAVE_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (publico) return true;
    if (!this.validador) throw new UnauthorizedException('Identidad no configurada');

    const peticion = contexto.switchToHttp().getRequest<PeticionHttp>();
    const cabecera = peticion.headers.authorization;
    const [esquema, token] = typeof cabecera === 'string' ? cabecera.split(' ') : [];
    if (esquema?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso');
    }
    try {
      const identidad = await this.validador.validar(token);
      peticion.identidad = identidad;
      fijarContexto(identidad);
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
