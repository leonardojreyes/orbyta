import { describe, expect, it } from 'vitest';
import { Nota, TituloInvalidoError } from './nota';

describe('Nota', () => {
  it('recorta el título y conserva la empresa', () => {
    const n = Nota.crear({ id: 'a', empresaId: 'e', titulo: '  Hola ' });
    expect(n.titulo).toBe('Hola');
    expect(n.empresaId).toBe('e');
  });

  it('rechaza un título vacío', () => {
    expect(() => Nota.crear({ id: 'a', empresaId: 'e', titulo: '  ' })).toThrow(TituloInvalidoError);
  });
});
