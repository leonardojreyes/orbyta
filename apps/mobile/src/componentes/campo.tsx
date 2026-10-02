import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTema } from './tema';

export interface CampoProps extends Omit<TextInputProps, 'style'> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

export function Campo({ etiqueta, ayuda, error, ...resto }: CampoProps) {
  const { colores } = useTema();
  return (
    <View className="gap-espacio-1">
      <Text className="text-md font-medium text-texto">{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        accessibilityHint={ayuda}
        placeholderTextColor={colores['texto-secundario']}
        className={`min-h-tactil-movil rounded-sm border bg-superficie px-espacio-3 text-lg text-texto ${error ? 'border-error' : 'border-borde-campo'}`}
        {...resto}
      />
      {ayuda ? (
        <Text className="text-sm text-texto-secundario">{ayuda}</Text>
      ) : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          className="text-sm font-medium text-error"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
