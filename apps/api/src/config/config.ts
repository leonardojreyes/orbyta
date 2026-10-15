import { z } from 'zod';

const esquema = z.object({
  PERFIL: z.enum(['local', 'servidor']),
  DATABASE_URL: z.string().url(),
  PUERTO_API: z.coerce.number().int().min(1).max(65535).default(3000),
  ANTHROPIC_API_KEY: z.string().optional(),
});

export type Configuracion = {
  perfil: 'local' | 'servidor';
  databaseUrl: string;
  puerto: number;
  anthropicApiKey?: string;
};

/** Valida el entorno al arrancar. Único lugar del código que debe leer process.env. */
export function cargarConfiguracion(entorno: NodeJS.ProcessEnv = process.env): Configuracion {
  const resultado = esquema.safeParse(entorno);
  if (!resultado.success) {
    const detalle = resultado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Configuración inválida: ${detalle}`);
  }
  const v = resultado.data;
  return {
    perfil: v.PERFIL,
    databaseUrl: v.DATABASE_URL,
    puerto: v.PUERTO_API,
    anthropicApiKey: v.ANTHROPIC_API_KEY || undefined,
  };
}
