import { EstadoOrdenServicio, OrdenServicio } from '@orbyta/ordenes-servicio-domain';
import { OrdenesServicioRepositoryEnMemoria } from './infrastructure';

describe('OrdenesServicioRepositoryEnMemoria', () => {
  it('aisla las ordenes por empresa', async () => {
    const repo = new OrdenesServicioRepositoryEnMemoria();
    const base: Omit<OrdenServicio, 'id' | 'empresaId'> = {
      abonadoId: 'b',
      descripcion: 'fuga de agua',
      tipoFalla: 'fuga',
      estado: EstadoOrdenServicio.Registrada,
      creadaEn: new Date(),
    };

    await repo.crear({ ...base, id: '1', empresaId: 'A' });
    await repo.crear({ ...base, id: '2', empresaId: 'B' });

    expect(await repo.listar('A')).toHaveLength(1);
    expect(await repo.obtener('B', '1')).toBeNull();
  });
});
