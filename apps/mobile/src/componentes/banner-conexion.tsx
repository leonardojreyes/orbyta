import { Text, View } from 'react-native';
import { es } from '@orbyta/ui/textos';

/** Estado sin conexión siempre visible, con los cambios que esperan sincronizar (ADR 021). */
export function BannerConexion({ pendientes }: { pendientes: number }) {
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="flex-row items-center justify-between bg-chip-riesgo-fondo px-espacio-4 py-espacio-2"
    >
      <Text className="text-md font-medium text-chip-riesgo-texto">
        {es.comunes.sinConexion}
      </Text>
      <Text className="text-sm text-chip-riesgo-texto">
        {pendientes} {es.comunes.cambiosPendientes}
      </Text>
    </View>
  );
}
