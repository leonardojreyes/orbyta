export enum EstadoOrdenServicio {
  Registrada = 'registrada',
  EnCurso = 'en_curso',
  Cerrada = 'cerrada',
}

export interface OrdenServicio {
  id: string;
  empresaId: string;
  abonadoId: string;
  descripcion: string;
  tipoFalla: string;
  estado: EstadoOrdenServicio;
  ubicacion?: { lat: number; lng: number };
  creadaEn: Date;
  cerradaEn?: Date;
}
