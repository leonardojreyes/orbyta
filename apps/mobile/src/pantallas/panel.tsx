import { ScrollView, Text, View } from 'react-native';
import { ordenesEjemplo, resumenEjemplo } from '@orbyta/ui/ejemplos';
import { es } from '@orbyta/ui/textos';
import { ChipEstado } from '../componentes/chip-estado';

/** Resumen de órdenes por estado y por plazo. Datos de ejemplo hasta el paso 0.6. */
export function PantallaPanel() {
  const r = resumenEjemplo(ordenesEjemplo);
  const tarjetas = [
    { clave: 'total', titulo: es.panel.total, valor: r.total },
    { clave: 'riesgo', titulo: es.panel.enRiesgo, valor: r.enRiesgo },
    { clave: 'vencidas', titulo: es.panel.vencidas, valor: r.vencidas },
  ];
  return (
    <ScrollView contentContainerClassName="gap-espacio-4 p-espacio-4">
      <Text
        accessibilityRole="header"
        className="text-2xl font-semibold text-texto"
      >
        {es.panel.titulo}
      </Text>
      {tarjetas.map((t) => (
        <View
          key={t.clave}
          accessible
          accessibilityLabel={`${t.titulo}: ${t.valor}`}
          className="min-h-tactil-movil-principal flex-row items-center justify-between rounded-md border border-borde-suave bg-superficie p-espacio-4"
        >
          <Text className="flex-1 text-lg text-texto">{t.titulo}</Text>
          <Text className="text-2xl font-semibold text-texto">{t.valor}</Text>
        </View>
      ))}
      <Text
        accessibilityRole="header"
        className="pt-espacio-2 text-xl font-semibold text-texto"
      >
        {es.panel.porEstado}
      </Text>
      {(['registrada', 'en_curso', 'cerrada'] as const).map((estado) => (
        <View
          key={estado}
          className="min-h-tactil-movil flex-row items-center justify-between"
        >
          <ChipEstado estado={estado} />
          <Text className="text-lg text-texto">{r[estado]}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
