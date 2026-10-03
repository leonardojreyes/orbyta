import { Pressable, Text, type PressableProps } from 'react-native';

type Variante = 'primario' | 'secundario' | 'peligro';

const fondos: Record<Variante, string> = {
  primario: 'bg-primario active:bg-primario-hover',
  secundario: 'border border-borde-campo bg-superficie',
  peligro: 'bg-error',
};
const textos: Record<Variante, string> = {
  primario: 'text-primario-texto',
  secundario: 'text-texto',
  peligro: 'text-error-texto',
};

export interface BotonProps extends Omit<PressableProps, 'children'> {
  etiqueta: string;
  variante?: Variante;
  /** Botón principal del técnico: 56 de alto en lugar de 48. */
  principal?: boolean;
}

/** Objetivo táctil mínimo de 48 px (56 px los principales), según la guía de estilo. */
export function Boton({
  etiqueta,
  variante = 'primario',
  principal = false,
  disabled,
  ...resto
}: BotonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={`${principal ? 'min-h-tactil-movil-principal' : 'min-h-tactil-movil'} items-center justify-center rounded-md px-espacio-5 ${fondos[variante]} ${disabled ? 'opacity-60' : ''}`}
      {...resto}
    >
      <Text className={`text-lg font-medium ${textos[variante]}`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}
