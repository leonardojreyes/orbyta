import { ScrollView, Text, View } from 'react-native';
import {
  estadoVisible,
  formatearFecha,
  type OrdenEjemplo,
} from '@orbyta/ui/ejemplos';
import { es } from '@orbyta/ui/textos';
import { Boton } from '../componentes/boton';
import { ChipEstado } from '../componentes/chip-estado';

/** Detalle de una OS a pantalla completa, con la acción principal al alcance del pulgar. */
export function PantallaDetalle({
  orden,
  alVolver,
}: {
  orden: OrdenEjemplo;
  alVolver: () => void;
}) {
  const datos: [string, string][] = [
    [es.detalle.abonado, orden.abonado],
    [es.detalle.puntoServicio, orden.puntoServicio],
    [es.ordenes.columnas.tipoFalla, orden.tipoFalla],
    [es.detalle.tecnico, orden.responsable ?? es.ordenes.sinResponsable],
    [es.ordenes.columnas.plazo, formatearFecha(orden.vence)],
  ];
  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="gap-espacio-4 p-espacio-4">
        <Text
          accessibilityRole="header"
          className="text-2xl font-semibold text-texto"
        >
          {orden.numero}
        </Text>
        <ChipEstado estado={estadoVisible(orden)} />
        <Text className="text-lg text-texto">{orden.descripcion}</Text>
        {datos.map(([clave, valor]) => (
          <View
            key={clave}
            accessible
            accessibilityLabel={`${clave}: ${valor}`}
            className="gap-espacio-1"
          >
            <Text className="text-sm text-texto-secundario">{clave}</Text>
            <Text className="text-lg font-medium text-texto">{valor}</Text>
          </View>
        ))}
        <Text
          accessibilityRole="header"
          className="pt-espacio-2 text-xl font-semibold text-texto"
        >
          {es.detalle.historial}
        </Text>
        {orden.historial.map((h) => (
          <View
            key={h.cuando + h.texto}
            className="gap-espacio-1 border-l-2 border-borde-suave pl-espacio-3"
          >
            <Text className="text-sm text-texto-secundario">{h.cuando}</Text>
            <Text className="text-md text-texto">{h.texto}</Text>
          </View>
        ))}
      </ScrollView>
      <View className="gap-espacio-2 border-t border-borde-suave bg-superficie p-espacio-4">
        {orden.estado !== 'cerrada' ? (
          <Boton
            etiqueta={es.detalle.cerrarOrden}
            principal
            onPress={alVolver}
          />
        ) : null}
        <Boton
          etiqueta={es.comunes.cerrar}
          variante="secundario"
          onPress={alVolver}
        />
      </View>
    </View>
  );
}
