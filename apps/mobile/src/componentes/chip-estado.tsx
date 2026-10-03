import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { es } from '@orbyta/ui/textos';
import { useTema } from './tema';

export type EstadoChip = keyof typeof es.estados;

const config: Record<
  EstadoChip,
  { fondo: string; texto: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  registrada: {
    fondo: 'bg-chip-neutro-fondo',
    texto: 'text-chip-neutro-texto',
    icono: 'ellipse-outline',
  },
  en_curso: {
    fondo: 'bg-chip-curso-fondo',
    texto: 'text-chip-curso-texto',
    icono: 'time-outline',
  },
  cerrada: {
    fondo: 'bg-chip-cerrada-fondo',
    texto: 'text-chip-cerrada-texto',
    icono: 'checkmark-circle-outline',
  },
  en_riesgo: {
    fondo: 'bg-chip-riesgo-fondo',
    texto: 'text-chip-riesgo-texto',
    icono: 'warning-outline',
  },
  vencida: {
    fondo: 'bg-chip-vencida-fondo',
    texto: 'text-chip-vencida-texto',
    icono: 'alert-circle-outline',
  },
};

const colorIcono: Record<
  EstadoChip,
  | 'chip-neutro-texto'
  | 'chip-curso-texto'
  | 'chip-cerrada-texto'
  | 'chip-riesgo-texto'
  | 'chip-vencida-texto'
> = {
  registrada: 'chip-neutro-texto',
  en_curso: 'chip-curso-texto',
  cerrada: 'chip-cerrada-texto',
  en_riesgo: 'chip-riesgo-texto',
  vencida: 'chip-vencida-texto',
};

/** Estado siempre con color, icono y texto: el color nunca es la única señal. */
export function ChipEstado({ estado }: { estado: EstadoChip }) {
  const { colores } = useTema();
  const { fondo, texto, icono } = config[estado];
  return (
    <View
      accessible
      accessibilityLabel={es.estados[estado]}
      className={`flex-row items-center gap-espacio-1 self-start rounded-sm px-espacio-2 py-espacio-1 ${fondo}`}
    >
      <Ionicons name={icono} size={16} color={colores[colorIcono[estado]]} />
      <Text className={`text-sm font-medium ${texto}`}>
        {es.estados[estado]}
      </Text>
    </View>
  );
}
