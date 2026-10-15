export interface IdentidadVerificada {
  usuarioId: string;
  empresaId: string;
  roles: string[];
}

/** Valida un token de acceso y devuelve quién es y de qué empresa. Nunca devuelve una identidad sin empresa. */
export interface ValidadorToken {
  validar(token: string): Promise<IdentidadVerificada>;
}

export class TokenInvalidoError extends Error {
  constructor(motivo: string) {
    super(`Token inválido: ${motivo}`);
    this.name = 'TokenInvalidoError';
  }
}
