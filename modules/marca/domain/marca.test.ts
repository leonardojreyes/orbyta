import { describe, expect, it } from 'vitest';
import { contraste } from './contraste';
import {
  COLOR_PRIMARIO_PREDETERMINADO,
  ColorInvalidoError,
  ColorNoAccesibleError,
  MarcaEmpresa,
  validarColorPrimario,
} from './marca';

describe('COLOR_PRIMARIO_PREDETERMINADO', () => {
  it('es #1d4ed8 y es accesible', () => {
    expect(COLOR_PRIMARIO_PREDETERMINADO).toBe('#1d4ed8');
    expect(() => validarColorPrimario(COLOR_PRIMARIO_PREDETERMINADO)).not.toThrow();
  });

  it('da más de 4,5:1 con texto blanco', () => {
    expect(contraste(COLOR_PRIMARIO_PREDETERMINADO, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('validarColorPrimario', () => {
  it.each(['#1d4ed8', '#2563eb', '#1D4ED8'])('acepta %s', (color) => {
    expect(() => validarColorPrimario(color)).not.toThrow();
  });

  it.each(['', '1d4ed8', '#fff', '#1d4ed', '#1d4ed88', '#gggggg', 'rgb(0,0,0)', ' #1d4ed8'])(
    'rechaza el formato de %j',
    (color) => {
      expect(() => validarColorPrimario(color)).toThrow(ColorInvalidoError);
    },
  );

  it.each(['#ffff00', '#808080'])('rechaza %s por contraste insuficiente', (color) => {
    expect(() => validarColorPrimario(color)).toThrow(ColorNoAccesibleError);
  });
});

describe('MarcaEmpresa', () => {
  it('conserva empresa, color y logo', () => {
    const m = MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId: 'l1' });
    expect(m.empresaId).toBe('e1');
    expect(m.colorPrimario).toBe('#2563eb');
    expect(m.logoId).toBe('l1');
  });

  it('permite no tener logo', () => {
    const m = MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb' });
    expect(m.logoId).toBeUndefined();
  });

  it('rechaza un color con formato inválido', () => {
    expect(() => MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: 'azul' })).toThrow(ColorInvalidoError);
  });

  it('rechaza un color no accesible', () => {
    expect(() => MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#ffff00' })).toThrow(
      ColorNoAccesibleError,
    );
  });
});
