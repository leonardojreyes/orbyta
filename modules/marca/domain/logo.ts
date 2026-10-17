const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
export const LOGO_TAMANO_MAXIMO = 256 * 1024;

export class LogoInvalidoError extends Error {
  constructor() {
    super('El logo debe ser un archivo PNG');
    this.name = 'LogoInvalidoError';
  }
}

export class LogoDemasiadoGrandeError extends Error {
  constructor() {
    super('El logo no puede superar 256 KB');
    this.name = 'LogoDemasiadoGrandeError';
  }
}

/** Solo PNG, reconocido por la firma de bytes, no por la extensión. */
export const validarLogo = (bytes: Uint8Array): void => {
  if (!FIRMA_PNG.every((b, i) => bytes[i] === b)) throw new LogoInvalidoError();
  if (bytes.length > LOGO_TAMANO_MAXIMO) throw new LogoDemasiadoGrandeError();
};
