import type { EjecutorEmpresa } from '@orbyta/tenancy';
import type { Auditor, EventoAuditoria, EventoRegistrado } from '../port';

interface Fila {
  id: string;
  empresa_id: string;
  usuario_id: string;
  accion: string;
  recurso: string | null;
  detalle: Record<string, unknown>;
  creado_en: Date;
}

export class AuditorPostgres implements Auditor {
  constructor(private readonly ejecutor: EjecutorEmpresa) {}

  async registrar(evento: EventoAuditoria): Promise<void> {
    await this.ejecutor.ejecutar(evento.empresaId, (tx) =>
      tx.consultar(
        'INSERT INTO auditoria_eventos (empresa_id, usuario_id, accion, recurso, detalle) VALUES ($1, $2, $3, $4, $5)',
        [evento.empresaId, evento.usuarioId, evento.accion, evento.recurso ?? null, JSON.stringify(evento.detalle ?? {})],
      ),
    );
  }

  async listar(empresaId: string, limite = 100): Promise<EventoRegistrado[]> {
    const filas = await this.ejecutor.ejecutar(empresaId, (tx) =>
      tx.consultar<Fila>(
        'SELECT * FROM auditoria_eventos WHERE empresa_id = $1 ORDER BY creado_en DESC, id LIMIT $2',
        [empresaId, limite],
      ),
    );
    return filas.map((f) => ({
      id: f.id,
      empresaId: f.empresa_id,
      usuarioId: f.usuario_id,
      accion: f.accion,
      recurso: f.recurso ?? undefined,
      detalle: f.detalle,
      creadoEn: f.creado_en,
    }));
  }
}
