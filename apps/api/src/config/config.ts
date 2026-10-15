import { z } from 'zod';

const esquema = z.object({
  PERFIL: z.enum(['local', 'servidor']),
  DATABASE_URL: z.string().url(),
  PUERTO_API: z.coerce.number().int().min(1).max(65535).default(3000),
  ANTHROPIC_API_KEY: z.string().optional(),
  OIDC_EMISOR: z.string().url().optional(),
  OIDC_AUDIENCIA: z.string().min(1).optional(),
  OIDC_JWKS_URL: z.string().url().optional(),
}).superRefine((v, ctx) => {
  if (v.PERFIL !== 'servidor') return;
  for (const clave of ['OIDC_EMISOR', 'OIDC_AUDIENCIA', 'OIDC_JWKS_URL'] as const) {
    if (!v[clave]) ctx.addIssue({ code: 'custom', path: [clave], message: 'obligatoria en el perfil servidor' });
  }
});

export type Configuracion = {
  perfil: 'local' | 'servidor';
  databaseUrl: string;
  puerto: number;
  anthropicApiKey?: string;
  /** Presente cuando hay proveedor OIDC configurado (obligatorio en `servidor`). */
  oidc?: { emisor: string; audiencia: string; jwksUrl: string };
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
    oidc:
      v.OIDC_EMISOR && v.OIDC_AUDIENCIA && v.OIDC_JWKS_URL
        ? { emisor: v.OIDC_EMISOR, audiencia: v.OIDC_AUDIENCIA, jwksUrl: v.OIDC_JWKS_URL }
        : undefined,
  };
}
