import { OrdenServicio } from '@orbyta/ordenes-servicio-domain';

export type CrearOrdenServicioDto = Pick<
  OrdenServicio,
  'abonadoId' | 'descripcion' | 'tipoFalla' | 'ubicacion'
>;
import { infrastructure } from '@orbyta/ordenes-servicio-infrastructure';

export const prohibida = infrastructure;
