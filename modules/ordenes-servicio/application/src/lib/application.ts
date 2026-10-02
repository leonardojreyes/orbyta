import { OrdenServicio } from '@orbyta/ordenes-servicio-domain';

export interface OrdenesServicioRepository {
  crear(orden: OrdenServicio): Promise<void>;
  listar(empresaId: string): Promise<OrdenServicio[]>;
  obtener(empresaId: string, id: string): Promise<OrdenServicio | null>;
}
