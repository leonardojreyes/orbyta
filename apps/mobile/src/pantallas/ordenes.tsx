import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import {
  columnasTablero,
  ordenesEjemplo,
  type OrdenEjemplo,
} from '@orbyta/ui/ejemplos';
import { es } from '@orbyta/ui/textos';
import { TarjetaOrden } from '../componentes/tarjeta-orden';

type Vista = 'lista' | 'tablero';

/** Listado de OS con vista de lista y de tablero (columnas con desplazamiento horizontal). */
export function PantallaOrdenes({
  alAbrir,
}: {
  alAbrir: (orden: OrdenEjemplo) => void;
}) {
  const [vista, setVista] = useState<Vista>('lista');
  const vistas: { id: Vista; etiqueta: string }[] = [
    { id: 'lista', etiqueta: es.ordenes.vistaLista },
    { id: 'tablero', etiqueta: es.ordenes.vistaTablero },
  ];
  return (
    <View className="flex-1 gap-espacio-3 p-espacio-4">
      <Text
        accessibilityRole="header"
        className="text-2xl font-semibold text-texto"
      >
        {es.ordenes.titulo}
      </Text>
      <View
        accessibilityRole="tablist"
        accessibilityLabel={es.ordenes.vistas}
        className="flex-row rounded-md border border-borde-campo bg-superficie p-0.5"
      >
        {vistas.map((v) => (
          <Pressable
            key={v.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: vista === v.id }}
            onPress={() => setVista(v.id)}
            className={`min-h-tactil-movil flex-1 items-center justify-center rounded-sm ${vista === v.id ? 'bg-primario' : ''}`}
          >
            <Text
              className={`text-lg font-medium ${vista === v.id ? 'text-primario-texto' : 'text-texto'}`}
            >
              {v.etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>
      {vista === 'lista' ? (
        <FlatList
          data={ordenesEjemplo}
          keyExtractor={(o) => o.id}
          contentContainerClassName="gap-espacio-3 pb-espacio-6"
          renderItem={({ item }) => (
            <TarjetaOrden orden={item} alAbrir={() => alAbrir(item)} />
          )}
        />
      ) : (
        <ScrollView
          horizontal
          contentContainerClassName="gap-espacio-3 pb-espacio-6"
        >
          {columnasTablero.map(({ id }) => (
            <View
              key={id}
              accessibilityLabel={es.estados[id]}
              className="w-72 gap-espacio-3 rounded-md bg-superficie p-espacio-3"
            >
              <Text
                accessibilityRole="header"
                className="text-lg font-semibold text-texto"
              >
                {es.estados[id]}
              </Text>
              {ordenesEjemplo
                .filter((o) => o.estado === id)
                .map((o) => (
                  <TarjetaOrden
                    key={o.id}
                    orden={o}
                    alAbrir={() => alAbrir(o)}
                  />
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
