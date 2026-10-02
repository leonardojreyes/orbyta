import { EstadoOrdenServicio, OrdenServicio } from '@orbyta/ordenes-servicio-domain';
import { OrdenesServicioRepository } from './application';

describe('OrdenesServicioRepository', () => {
  it('el contrato del puerto usa la entidad de dominio', () => {
    const orden: OrdenServicio = {
      id: '1',
      empresaId: 'a',
      abonadoId: 'b',
      descripcion: 'fuga de agua',
      tipoFalla: 'fuga',
      estado: EstadoOrdenServicio.Registrada,
      creadaEn: new Date(),
    };
    const repo: OrdenesServicioRepository = {
      crear: async () => undefined,
      listar: async () => [orden],
      obtener: async () => orden,
    };
    expect(repo).toBeDefined();
  });
});
