export interface EventoAuditoria {
  empresaId: string;
  usuarioId: string;
  /** Verbo del dominio, por ejemplo `nota.crear`. */
  accion: string;
  /** Identificador del recurso afectado, si aplica. Nunca datos personales. */
  recurso?: string;
  /** Contexto adicional sin datos personales ni secretos. */
  detalle?: Record<string, unknown>;
}

export interface EventoRegistrado extends EventoAuditoria {
  id: string;
  creadoEn: Date;
}

/** Registro append-only de quién hizo qué y cuándo, separado por empresa. */
export interface Auditor {
  registrar(evento: EventoAuditoria): Promise<void>;
  /** Eventos de la empresa, del más reciente al más antiguo. */
  listar(empresaId: string, limite?: number): Promise<EventoRegistrado[]>;
}
