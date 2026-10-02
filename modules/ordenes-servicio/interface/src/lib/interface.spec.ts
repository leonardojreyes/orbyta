import { CrearOrdenServicioDto } from './interface';

describe('CrearOrdenServicioDto', () => {
  it('no incluye campos que el cliente no debe enviar', () => {
    const dto: CrearOrdenServicioDto = {
      abonadoId: 'b',
      descripcion: 'fuga de agua',
      tipoFalla: 'fuga',
    };
    expect('estado' in dto).toBe(false);
  });
});
