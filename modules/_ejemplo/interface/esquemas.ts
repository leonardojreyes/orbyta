import { z } from 'zod';

export const esquemaCrearNota = z.object({ titulo: z.string().min(1).max(200) });
export type CrearNotaDto = z.infer<typeof esquemaCrearNota>;
