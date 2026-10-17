import { describe, expect, it } from 'vitest';
import { contraste } from './contraste';

describe('contraste', () => {
  it('da 21 entre negro y blanco', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('da 1 entre colores iguales', () => {
    expect(contraste('#1d4ed8', '#1d4ed8')).toBeCloseTo(1, 5);
  });

  it('es simétrico', () => {
    expect(contraste('#1d4ed8', '#ffffff')).toBeCloseTo(contraste('#ffffff', '#1d4ed8'), 10);
  });

  it('coincide con valores WCAG conocidos', () => {
    expect(contraste('#767676', '#ffffff')).toBeCloseTo(4.54, 1);
    expect(contraste('#777777', '#ffffff')).toBeCloseTo(4.48, 1);
    expect(contraste('#1d4ed8', '#ffffff')).toBeCloseTo(6.7, 1);
  });

  it('no distingue mayúsculas en el hexadecimal', () => {
    expect(contraste('#1D4ED8', '#FFFFFF')).toBeCloseTo(contraste('#1d4ed8', '#ffffff'), 10);
  });
});
