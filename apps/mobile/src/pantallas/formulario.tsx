import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { es } from '@orbyta/ui/textos';
import { Boton } from '../componentes/boton';
import { Campo } from '../componentes/campo';

/** Formulario de nueva OS. Funciona sin conexión: el envío queda en cola (ADR 021). */
export function PantallaFormulario({ alTerminar }: { alTerminar: () => void }) {
  const [abonado, setAbonado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoFalla, setTipoFalla] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [intentado, setIntentado] = useState(false);
  const requerido = (v: string) =>
    intentado && !v ? es.formulario.errorRequerido : undefined;

  return (
    <ScrollView
      contentContainerClassName="gap-espacio-4 p-espacio-4 pb-espacio-7"
      keyboardShouldPersistTaps="handled"
    >
      <Text
        accessibilityRole="header"
        className="text-2xl font-semibold text-texto"
      >
        {es.formulario.titulo}
      </Text>
      <Campo
        etiqueta={es.formulario.abonado}
        value={abonado}
        onChangeText={setAbonado}
        error={requerido(abonado)}
      />
      <Campo
        etiqueta={es.formulario.descripcion}
        ayuda={es.formulario.ayudaDescripcion}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
        error={requerido(descripcion)}
      />
      <View className="gap-espacio-2">
        <Text className="text-md font-medium text-texto">
          {es.formulario.tipoFalla}
        </Text>
        <View accessibilityRole="radiogroup" className="gap-espacio-2">
          {es.formulario.tiposFalla.map((t) => (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityState={{ checked: tipoFalla === t }}
              onPress={() => setTipoFalla(t)}
              className={`min-h-tactil-movil justify-center rounded-md border px-espacio-4 ${tipoFalla === t ? 'border-primario bg-chip-curso-fondo' : 'border-borde-campo bg-superficie'}`}
            >
              <Text
                className={`text-lg ${tipoFalla === t ? 'font-medium text-chip-curso-texto' : 'text-texto'}`}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        {requerido(tipoFalla) ? (
          <Text
            accessibilityRole="alert"
            className="text-sm font-medium text-error"
          >
            {requerido(tipoFalla)}
          </Text>
        ) : null}
      </View>
      <Campo
        etiqueta={`${es.formulario.ubicacion} (${es.comunes.opcional})`}
        ayuda={es.formulario.ayudaUbicacion}
        value={ubicacion}
        onChangeText={setUbicacion}
      />
      <Boton
        etiqueta={es.formulario.crear}
        principal
        onPress={() => {
          setIntentado(true);
          if (abonado && descripcion && tipoFalla) alTerminar();
        }}
      />
      <Boton
        etiqueta={es.comunes.cancelar}
        variante="secundario"
        onPress={alTerminar}
      />
    </ScrollView>
  );
}
