export interface MensajeIA {
  rol: 'sistema' | 'usuario' | 'asistente';
  contenido: string;
}

export interface RespuestaIA {
  texto: string;
  /** Identifica quién respondió (modelo real o `simulado`). */
  modelo: string;
}

/** Puerto de IA (ADR 009). Opcional y sustituible; cada llamada se atribuye a una empresa. */
export interface ModeloIA {
  completar(empresaId: string, mensajes: MensajeIA[]): Promise<RespuestaIA>;
}

export class SolicitudIAInvalidaError extends Error {
  constructor(motivo: string) {
    super(`Solicitud de IA inválida: ${motivo}`);
    this.name = 'SolicitudIAInvalidaError';
  }
}
