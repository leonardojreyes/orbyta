import { describe, expect, it } from 'vitest';
import { LogoDemasiadoGrandeError, LogoInvalidoError, validarLogo } from './logo';

const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAXIMO = 256 * 1024;

const png = (tamano: number): Uint8Array => {
  const bytes = new Uint8Array(tamano);
  bytes.set(FIRMA_PNG);
  return bytes;
};

describe('validarLogo', () => {
  it('acepta un PNG pequeño', () => {
    expect(() => validarLogo(png(100))).not.toThrow();
  });

  it('acepta un PNG de exactamente 256 KB', () => {
    expect(() => validarLogo(png(MAXIMO))).not.toThrow();
  });

  it('rechaza un PNG de 256 KB más un byte', () => {
    expect(() => validarLogo(png(MAXIMO + 1))).toThrow(LogoDemasiadoGrandeError);
  });

  it('rechaza un archivo sin la firma PNG', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0]);
    expect(() => validarLogo(jpeg)).toThrow(LogoInvalidoError);
  });

  it('rechaza contenido vacío', () => {
    expect(() => validarLogo(new Uint8Array(0))).toThrow(LogoInvalidoError);
  });

  it('rechaza una firma PNG incompleta', () => {
    expect(() => validarLogo(new Uint8Array(FIRMA_PNG.slice(0, 7)))).toThrow(LogoInvalidoError);
  });

  it('rechaza una firma con un byte alterado', () => {
    const bytes = png(100);
    bytes[7] = 0x0b;
    expect(() => validarLogo(bytes)).toThrow(LogoInvalidoError);
  });
});
