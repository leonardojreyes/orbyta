import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { es } from '@orbyta/ui/textos';
import { Aviso } from '../componentes/aviso';
import { Boton } from '../componentes/boton';
import { Campo } from '../componentes/campo';

const EMPRESA = 'Agua Potable Ejemplo';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoOrbyta = require('../../assets/marca/orbyta-logo.png');

/** Inicio de sesión. Maqueta: la autenticación real llega en el paso 0.6. */
export function PantallaIngresar({ alIngresar }: { alIngresar: () => void }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [intentado, setIntentado] = useState(false);
  const faltan = intentado && (!usuario || !contrasena);

  return (
    <View className="flex-1 justify-center gap-espacio-4 p-espacio-5">
      <View className="items-center gap-espacio-2">
        <Text className="text-xl font-semibold text-texto">{EMPRESA}</Text>
        <Text
          accessibilityRole="header"
          className="text-2xl font-semibold text-texto"
        >
          {es.login.titulo}
        </Text>
      </View>
      {faltan ? (
        <Aviso tipo="error" texto={es.login.errorCredenciales} />
      ) : null}
      <Campo
        etiqueta={es.login.usuario}
        ayuda={es.login.ayudaUsuario}
        autoCapitalize="none"
        autoComplete="username"
        value={usuario}
        onChangeText={setUsuario}
        error={intentado && !usuario ? es.formulario.errorRequerido : undefined}
      />
      <Campo
        etiqueta={es.login.contrasena}
        secureTextEntry
        autoComplete="password"
        value={contrasena}
        onChangeText={setContrasena}
        error={
          intentado && !contrasena ? es.formulario.errorRequerido : undefined
        }
      />
      <Boton
        etiqueta={es.login.ingresar}
        principal
        onPress={() => {
          setIntentado(true);
          if (usuario && contrasena) alIngresar();
        }}
      />
      <View className="items-center pt-espacio-4">
        <Image
          source={logoOrbyta}
          accessibilityLabel={es.marca.logoOrbyta}
          style={{ width: 160, height: 122 }}
          className="rounded-md"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
