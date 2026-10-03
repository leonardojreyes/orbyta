import { Pressable, Text, View } from 'react-native';
import {
  estadoVisible,
  formatearFecha,
  type OrdenEjemplo,
} from '@orbyta/ui/ejemplos';
import { es } from '@orbyta/ui/textos';
import { ChipEstado } from './chip-estado';

/** Tarjeta de OS: un toque abre el detalle. Alto mínimo táctil de 56 px. */
export function TarjetaOrden({
  orden,
  alAbrir,
}: {
  orden: OrdenEjemplo;
  alAbrir: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${orden.numero}, ${orden.descripcion}, ${es.estados[estadoVisible(orden)]}`}
      onPress={alAbrir}
      className="min-h-tactil-movil-principal gap-espacio-2 rounded-md border border-borde-suave bg-superficie p-espacio-4 active:bg-fondo"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-md font-semibold text-texto">{orden.numero}</Text>
        <Text className="text-sm text-texto-secundario">
          {formatearFecha(orden.vence)}
        </Text>
      </View>
      <Text className="text-lg text-texto">{orden.descripcion}</Text>
      <ChipEstado estado={estadoVisible(orden)} />
    </Pressable>
  );
}
