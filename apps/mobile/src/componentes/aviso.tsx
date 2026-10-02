import { Text, View } from 'react-native';

const clases = {
  exito: 'bg-chip-cerrada-fondo text-chip-cerrada-texto',
  info: 'bg-chip-curso-fondo text-chip-curso-texto',
  advertencia: 'bg-chip-riesgo-fondo text-chip-riesgo-texto',
  error: 'bg-chip-vencida-fondo text-chip-vencida-texto',
} as const;

export function Aviso({
  tipo,
  texto,
}: {
  tipo: keyof typeof clases;
  texto: string;
}) {
  const [fondo, color] = clases[tipo].split(' ') as [string, string];
  return (
    <View
      accessible
      accessibilityRole={
        tipo === 'error' || tipo === 'advertencia' ? 'alert' : undefined
      }
      accessibilityLiveRegion="polite"
      className={`rounded-md p-espacio-3 ${fondo}`}
    >
      <Text className={`text-md ${color}`}>{texto}</Text>
    </View>
  );
}
