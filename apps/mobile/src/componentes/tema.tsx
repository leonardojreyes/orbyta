import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { useColorScheme, vars } from 'nativewind';
import { temas, varsDeTema } from '@orbyta/tokens';

type Esquema = 'claro' | 'oscuro';

interface ContextoTema {
  esquema: Esquema;
  /** Valores resueltos del tema, para props que no aceptan clases (color de iconos, marcadores de posición). */
  colores: (typeof temas)[Esquema];
  alternar: () => void;
}

const Contexto = createContext<ContextoTema>({
  esquema: 'claro',
  colores: temas.claro,
  alternar: () => undefined,
});

export const useTema = () => useContext(Contexto);

/** Aplica los tokens del tema (claro u oscuro, según el sistema o la elección del usuario) a toda la app. */
export function ProveedorTema({ children }: { children: ReactNode }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const esquema: Esquema = colorScheme === 'dark' ? 'oscuro' : 'claro';
  const valor = useMemo(
    () => ({ esquema, colores: temas[esquema], alternar: toggleColorScheme }),
    [esquema, toggleColorScheme],
  );
  const estilo = useMemo(() => vars(varsDeTema(esquema)), [esquema]);
  return (
    <Contexto.Provider value={valor}>
      <View style={estilo} className="flex-1 bg-fondo">
        {children}
      </View>
    </Contexto.Provider>
  );
}
