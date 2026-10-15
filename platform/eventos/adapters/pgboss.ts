import { PgBoss } from 'pg-boss';
import { EmpresaRequeridaError, type Transaccion } from '@orbyta/tenancy';
import { TareaInvalidaError, type ColaTareas } from '../port';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Sobre {
  empresaId: string;
  carga: unknown;
}

/** Valida el sobre de una tarea antes de ejecutarla: sin empresa válida no corre. */
export function leerSobre(datos: unknown): Sobre {
  if (typeof datos !== 'object' || datos === null) throw new TareaInvalidaError('sin sobre');
  const { empresaId, carga } = datos as Record<string, unknown>;
  if (typeof empresaId !== 'string' || !UUID.test(empresaId)) {
    throw new TareaInvalidaError('empresa ausente o inválida');
  }
  return { empresaId, carga };
}

/**
 * Instala el esquema de pg-boss y crea las colas. Corre con el rol de migraciones (necesita DDL),
 * nunca con el rol de la app.
 */
export async function instalarCola(urlMigraciones: string, colas: string[]): Promise<void> {
  const boss = new PgBoss({ connectionString: urlMigraciones, supervise: false, schedule: false, registerInstance: false });
  boss.on('error', () => undefined);
  await boss.start();
  try {
    for (const cola of colas) await boss.createQueue(cola);
  } finally {
    await boss.stop({ graceful: false });
  }
}

export class ColaTareasPgBoss implements ColaTareas {
  private readonly boss: PgBoss;
  private iniciada?: Promise<void>;

  /** `urlApp` es el rol de la app (sin DDL): el esquema debe haberse instalado con `instalarCola`. */
  constructor(urlApp: string) {
    this.boss = new PgBoss({
      connectionString: urlApp,
      migrate: false,
      createSchema: false,
      supervise: false,
      schedule: false,
      registerInstance: false,
      max: 4,
    });
    this.boss.on('error', () => undefined);
  }

  private iniciar(): Promise<void> {
    this.iniciada ??= this.boss.start().then(() => undefined);
    return this.iniciada;
  }

  async encolar(tx: Transaccion, empresaId: string, cola: string, carga: unknown): Promise<void> {
    if (!UUID.test(empresaId)) throw new EmpresaRequeridaError();
    await this.iniciar();
    const db = { executeSql: async (texto: string, valores: unknown[]) => ({ rows: await tx.consultar(texto, valores) }) };
    const sobre: Sobre = { empresaId, carga };
    await this.boss.send(cola, sobre as unknown as object, { db });
  }

  async trabajar(cola: string, manejador: (empresaId: string, carga: unknown) => Promise<void>): Promise<void> {
    await this.iniciar();
    await this.boss.work(cola, { pollingIntervalSeconds: 0.5 }, async (tareas) => {
      for (const tarea of tareas) {
        const { empresaId, carga } = leerSobre(tarea.data);
        await manejador(empresaId, carga);
      }
    });
  }

  async cerrar(): Promise<void> {
    if (this.iniciada) await this.boss.stop({ graceful: false });
  }
}
