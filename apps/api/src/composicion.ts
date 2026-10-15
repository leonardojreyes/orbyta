import { CrearNota, ListarNotas, RepositorioNotasPostgres } from '@orbyta/modulo-ejemplo';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import type { Configuracion } from './config/config';

/**
 * Raíz de composición: único lugar que elige adaptadores según el perfil.
 * Hoy local y servidor usan PostgreSQL; los demás puertos llegan en el paso 0.4.
 */
export function componer(config: Configuracion) {
  const ejecutor = new EjecutorEmpresaPostgres(config.databaseUrl);
  const notas = new RepositorioNotasPostgres(ejecutor);
  return {
    ejecutor,
    casosDeUso: {
      crearNota: new CrearNota(notas),
      listarNotas: new ListarNotas(notas),
    },
  };
}
