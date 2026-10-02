# ADR 005: Móvil — React Native + Expo, builds locales

## Estado
Aceptado — Fase 0, paso 0.1 (2026-10-01)

## Contexto
La app móvil es para técnicos de campo (iOS y Android), debe operar **sin conexión** (confirmado en la ronda de preguntas de arranque: los técnicos trabajan sin señal), y el equipo de desarrollo usa Windows y macOS, con builds de iOS que requieren macOS.

## Decisión
Móvil en **React Native + Expo**, con **builds locales** (sin servicio de build en la nube, por ser on-premise y evitar dependencias externas). Comparte lenguaje (TypeScript) y parte de la UI (NativeWind, ADR 019) con la web. El modo sin conexión se resuelve con SQLite local + cola de sincronización (ADR 021).

## Alternativas consideradas
- **Nativo (Swift/Kotlin por separado):** mejor acceso a APIs nativas, pero duplica el desarrollo de UI/lógica entre iOS y Android y no comparte nada con TypeScript del backend/web, incompatible con el plazo.
- **Flutter:** un solo código para iOS/Android, pero en Dart, sin compartir tipos ni librerías con el backend TypeScript ni con la web React.

## Consecuencias
- Los builds de Android pueden hacerse en cualquier equipo; los de iOS requieren macOS (regla 5.1 de equipos).
- El esquema de datos local (SQLite) y la cola de sincronización se diseñan desde la Fase 0, aunque la implementación completa es de Fase 1 (ADR 021).
- La distribución es interna (sin App Store/Play Store en Fase 0), acorde al despliegue on-premise.

## Licencia
React Native y Expo (SDK) son MIT.
