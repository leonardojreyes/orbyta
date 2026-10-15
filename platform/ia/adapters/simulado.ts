import { SolicitudIAInvalidaError, type MensajeIA, type ModeloIA, type RespuestaIA } from '../port';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Adaptador determinista para pruebas y perfil local: no llama a ningún proveedor. */
export class ModeloIASimulado implements ModeloIA {
  async completar(empresaId: string, mensajes: MensajeIA[]): Promise<RespuestaIA> {
    if (!UUID.test(empresaId)) throw new SolicitudIAInvalidaError('empresa inválida');
    const ultimo = [...mensajes].reverse().find((m) => m.rol === 'usuario');
    if (!ultimo || !ultimo.contenido.trim()) throw new SolicitudIAInvalidaError('sin mensaje de usuario');
    return { texto: `[simulado] ${ultimo.contenido}`, modelo: 'simulado' };
  }
}
