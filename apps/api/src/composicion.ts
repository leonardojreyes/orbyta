import { CrearNota, ListarNotas, RepositorioNotasPostgres } from '@orbyta/modulo-ejemplo';
import { AutorizacionPostgres } from '@orbyta/autorizacion';
import { ValidadorTokenOidc, clavesDesdeJwks } from '@orbyta/identidad';
import { EjecutorEmpresaPostgres } from '@orbyta/tenancy';
import type { Configuracion } from './config/config';

/**
 * Raíz de composición: único lugar que elige adaptadores según el perfil.
 * Hoy local y servidor usan PostgreSQL; los demás puertos llegan en el paso 0.4.
 * Sin configuración OIDC no hay validador y toda ruta no pública responde 401.
 */
export function componer(config: Configuracion) {
  const ejecutor = new EjecutorEmpresaPostgres(config.databaseUrl);
  const notas = new RepositorioNotasPostgres(ejecutor);
  const validador = config.oidc
    ? new ValidadorTokenOidc({
        emisor: config.oidc.emisor,
        audiencia: config.oidc.audiencia,
        claves: clavesDesdeJwks(config.oidc.jwksUrl),
      })
    : undefined;
  const autorizacion = new AutorizacionPostgres(ejecutor);
  return {
    ejecutor,
    validador,
    autorizador: autorizacion,
    administradorRoles: autorizacion,
    casosDeUso: {
      crearNota: new CrearNota(notas),
      listarNotas: new ListarNotas(notas),
    },
  };
}
