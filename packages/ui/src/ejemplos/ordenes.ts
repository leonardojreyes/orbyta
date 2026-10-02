/** Datos de ejemplo para las pantallas plantilla (paso 0.5). Ficticios: sin datos personales reales (LOPDP). */
export type EstadoOrden = 'registrada' | 'en_curso' | 'cerrada';
export type IndicadorPlazo = 'ok' | 'en_riesgo' | 'vencida';

export interface OrdenEjemplo {
  id: string;
  numero: string;
  descripcion: string;
  tipoFalla: string;
  estado: EstadoOrden;
  plazo: IndicadorPlazo;
  /** Fecha límite (aaaa-mm-dd) */
  vence: string;
  responsable?: string;
  abonado: string;
  puntoServicio: string;
  historial: readonly { cuando: string; texto: string }[];
}

export const ordenesEjemplo: readonly OrdenEjemplo[] = [
  {
    id: 'os-0001',
    numero: 'OS-0001',
    descripcion: 'Fuga de agua en la vereda frente al medidor',
    tipoFalla: 'Fuga de agua',
    estado: 'en_curso',
    plazo: 'en_riesgo',
    vence: '2026-10-05',
    responsable: 'Ana Pérez',
    abonado: 'Abonado 0123',
    puntoServicio: 'Calle 10 y Av. 5, sector Norte',
    historial: [
      { cuando: '02/10/2026 08:15', texto: 'Orden registrada' },
      { cuando: '02/10/2026 09:40', texto: 'Asignada a la cuadrilla 2' },
    ],
  },
  {
    id: 'os-0002',
    numero: 'OS-0002',
    descripcion: 'Sin servicio de agua desde la madrugada',
    tipoFalla: 'Sin servicio',
    estado: 'registrada',
    plazo: 'vencida',
    vence: '2026-10-01',
    abonado: 'Abonado 0456',
    puntoServicio: 'Pasaje 3, manzana B',
    historial: [{ cuando: '30/09/2026 06:05', texto: 'Orden registrada' }],
  },
  {
    id: 'os-0003',
    numero: 'OS-0003',
    descripcion: 'Baja presión en la planta alta',
    tipoFalla: 'Baja presión',
    estado: 'registrada',
    plazo: 'ok',
    vence: '2026-10-09',
    responsable: 'Luis Andrade',
    abonado: 'Abonado 0789',
    puntoServicio: 'Av. Principal s/n',
    historial: [{ cuando: '02/10/2026 10:30', texto: 'Orden registrada' }],
  },
  {
    id: 'os-0004',
    numero: 'OS-0004',
    descripcion: 'Medidor con la carátula rota',
    tipoFalla: 'Medidor dañado',
    estado: 'en_curso',
    plazo: 'ok',
    vence: '2026-10-08',
    responsable: 'Marta Salazar',
    abonado: 'Abonado 1042',
    puntoServicio: 'Calle 22 y Calle 7',
    historial: [
      { cuando: '01/10/2026 14:00', texto: 'Orden registrada' },
      { cuando: '02/10/2026 07:50', texto: 'Técnico en camino' },
    ],
  },
  {
    id: 'os-0005',
    numero: 'OS-0005',
    descripcion: 'Agua turbia al abrir la llave',
    tipoFalla: 'Calidad del agua',
    estado: 'cerrada',
    plazo: 'ok',
    vence: '2026-09-30',
    responsable: 'Ana Pérez',
    abonado: 'Abonado 0321',
    puntoServicio: 'Urbanización Los Pinos, casa 14',
    historial: [
      { cuando: '29/09/2026 11:20', texto: 'Orden registrada' },
      { cuando: '30/09/2026 16:45', texto: 'Orden cerrada' },
    ],
  },
];

export const columnasTablero: readonly {
  estado: EstadoOrden;
  id: EstadoOrden;
}[] = [
  { id: 'registrada', estado: 'registrada' },
  { id: 'en_curso', estado: 'en_curso' },
  { id: 'cerrada', estado: 'cerrada' },
];

/** Formatea `aaaa-mm-dd` como `dd/mm/aaaa` (formato de Ecuador), sin depender de la configuración regional. */
export const formatearFecha = (iso: string): string => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

/** Estado que se muestra en el chip: el plazo en riesgo o vencido tiene prioridad salvo que la orden esté cerrada. */
export const estadoVisible = (
  o: Pick<OrdenEjemplo, 'estado' | 'plazo'>,
): 'registrada' | 'en_curso' | 'cerrada' | 'en_riesgo' | 'vencida' =>
  o.estado !== 'cerrada' && o.plazo !== 'ok' ? o.plazo : o.estado;

export const resumenEjemplo = (ordenes: readonly OrdenEjemplo[]) => ({
  total: ordenes.length,
  registrada: ordenes.filter((o) => o.estado === 'registrada').length,
  en_curso: ordenes.filter((o) => o.estado === 'en_curso').length,
  cerrada: ordenes.filter((o) => o.estado === 'cerrada').length,
  enRiesgo: ordenes.filter(
    (o) => o.estado !== 'cerrada' && o.plazo === 'en_riesgo',
  ).length,
  vencidas: ordenes.filter(
    (o) => o.estado !== 'cerrada' && o.plazo === 'vencida',
  ).length,
});
