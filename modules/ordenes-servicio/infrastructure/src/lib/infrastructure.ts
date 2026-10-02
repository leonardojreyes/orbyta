import { OrdenServicio } from '@orbyta/ordenes-servicio-domain';
import { OrdenesServicioRepository } from '@orbyta/ordenes-servicio-application';

export class OrdenesServicioRepositoryEnMemoria implements OrdenesServicioRepository {
  private readonly ordenes: OrdenServicio[] = [];

  async crear(orden: OrdenServicio): Promise<void> {
    this.ordenes.push(orden);
  }

  async listar(empresaId: string): Promise<OrdenServicio[]> {
    return this.ordenes.filter((o) => o.empresaId === empresaId);
  }

  async obtener(empresaId: string, id: string): Promise<OrdenServicio | null> {
    return (
      this.ordenes.find((o) => o.empresaId === empresaId && o.id === id) ?? null
    );
  }
}
