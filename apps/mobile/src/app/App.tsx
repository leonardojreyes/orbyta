import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { OrdenEjemplo } from '@orbyta/ui/ejemplos';
import { es } from '@orbyta/ui/textos';
import { BannerConexion } from '../componentes/banner-conexion';
import { ProveedorTema, useTema } from '../componentes/tema';
import { PantallaDetalle } from '../pantallas/detalle';
import { PantallaFormulario } from '../pantallas/formulario';
import { PantallaIngresar } from '../pantallas/ingresar';
import { PantallaOrdenes } from '../pantallas/ordenes';
import { PantallaPanel } from '../pantallas/panel';

type Ruta =
  | { nombre: 'ingresar' }
  | { nombre: 'panel' }
  | { nombre: 'ordenes' }
  | { nombre: 'nueva' }
  | { nombre: 'detalle'; orden: OrdenEjemplo };

function Contenido() {
  const { esquema, colores, alternar } = useTema();
  const [ruta, setRuta] = useState<Ruta>({ nombre: 'ingresar' });
  const [sinConexion, setSinConexion] = useState(false);
  const enSesion = ruta.nombre !== 'ingresar';

  return (
    <SafeAreaView className="flex-1 bg-fondo">
      <StatusBar style={esquema === 'oscuro' ? 'light' : 'dark'} />
      {sinConexion ? <BannerConexion pendientes={2} /> : null}
      <View className="flex-1">
        {ruta.nombre === 'ingresar' ? (
          <PantallaIngresar alIngresar={() => setRuta({ nombre: 'panel' })} />
        ) : null}
        {ruta.nombre === 'panel' ? <PantallaPanel /> : null}
        {ruta.nombre === 'ordenes' ? (
          <PantallaOrdenes
            alAbrir={(orden) => setRuta({ nombre: 'detalle', orden })}
          />
        ) : null}
        {ruta.nombre === 'nueva' ? (
          <PantallaFormulario
            alTerminar={() => setRuta({ nombre: 'ordenes' })}
          />
        ) : null}
        {ruta.nombre === 'detalle' ? (
          <PantallaDetalle
            orden={ruta.orden}
            alVolver={() => setRuta({ nombre: 'ordenes' })}
          />
        ) : null}
      </View>
      {enSesion ? (
        <View
          accessibilityRole="tablist"
          className="flex-row border-t border-borde-suave bg-superficie"
        >
          {[
            { clave: 'panel', etiqueta: es.navegacion.inicio },
            { clave: 'ordenes', etiqueta: es.navegacion.ordenes },
            { clave: 'nueva', etiqueta: es.navegacion.nuevaOrden },
          ].map((p) => (
            <Pressable
              key={p.clave}
              accessibilityRole="tab"
              accessibilityState={{ selected: ruta.nombre === p.clave }}
              onPress={() => setRuta({ nombre: p.clave } as Ruta)}
              className="min-h-tactil-movil-principal flex-1 items-center justify-center"
            >
              <Text
                className={`text-md ${ruta.nombre === p.clave ? 'font-semibold text-primario' : 'text-texto'}`}
              >
                {p.etiqueta}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={es.tema.cambiar}
            onPress={alternar}
            className="min-h-tactil-movil-principal min-w-tactil-movil-principal items-center justify-center"
          >
            <Ionicons
              name={esquema === 'claro' ? 'moon-outline' : 'sunny-outline'}
              size={24}
              color={colores.texto}
            />
          </Pressable>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: sinConexion }}
            accessibilityLabel={es.comunes.sinConexion}
            onPress={() => setSinConexion((s) => !s)}
            className="min-h-tactil-movil-principal min-w-tactil-movil-principal items-center justify-center"
          >
            <Ionicons
              name={
                sinConexion ? 'cloud-offline-outline' : 'cloud-done-outline'
              }
              size={24}
              color={colores.texto}
            />
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export const App = () => (
  <SafeAreaProvider>
    <ProveedorTema>
      <Contenido />
    </ProveedorTema>
  </SafeAreaProvider>
);

export default App;
