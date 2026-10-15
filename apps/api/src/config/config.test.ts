import { describe, expect, it } from 'vitest';
import { cargarConfiguracion } from './config';

const base = { PERFIL: 'local', DATABASE_URL: 'postgres://u:p@localhost:5432/orbyta' };

describe('cargarConfiguracion', () => {
  it('acepta un entorno válido y aplica valores por defecto', () => {
    const c = cargarConfiguracion(base);
    expect(c.perfil).toBe('local');
    expect(c.puerto).toBe(3000);
    expect(c.archivosDir).toBe('datos/archivos');
  });

  it('falla si falta PERFIL', () => {
    expect(() => cargarConfiguracion({ DATABASE_URL: base.DATABASE_URL })).toThrow(/PERFIL/);
  });

  it('falla con un perfil desconocido', () => {
    expect(() => cargarConfiguracion({ ...base, PERFIL: 'prod' })).toThrow(/PERFIL/);
  });

  it('exige OIDC en el perfil servidor', () => {
    expect(() => cargarConfiguracion({ ...base, PERFIL: 'servidor' })).toThrow(/OIDC_EMISOR/);
  });

  it('expone la configuración OIDC cuando está completa', () => {
    const c = cargarConfiguracion({
      ...base,
      OIDC_EMISOR: 'https://id.test/realms/orbyta',
      OIDC_AUDIENCIA: 'orbyta-api',
      OIDC_JWKS_URL: 'https://id.test/realms/orbyta/certs',
    });
    expect(c.oidc?.audiencia).toBe('orbyta-api');
  });
});
