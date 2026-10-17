import { describe, expect, it } from 'vitest';
import type { AlmacenArchivos } from '@orbyta/archivos';
import { MarcaEmpresa } from '../domain/marca';
import { RepositorioMarcaMemoria } from '../infrastructure/repositorio-marca-memoria';
import { ObtenerLogo } from './obtener-logo';

/** Almacén en memoria separado por empresa. */
class AlmacenFake implements AlmacenArchivos {
  readonly datos = new Map<string, Map<string, Uint8Array>>();
  private n = 0;

  async guardar(empresaId: string, contenido: Uint8Array): Promise<string> {
    const id = `archivo-${++this.n}`;
    const e = this.datos.get(empresaId) ?? new Map<string, Uint8Array>();
    e.set(id, contenido);
    this.datos.set(empresaId, e);
    return id;
  }

  async leer(empresaId: string, archivoId: string): Promise<Uint8Array | null> {
    return this.datos.get(empresaId)?.get(archivoId) ?? null;
  }

  async eliminar(empresaId: string, archivoId: string): Promise<boolean> {
    return this.datos.get(empresaId)?.delete(archivoId) ?? false;
  }
}

const BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

describe('ObtenerLogo', () => {
  it('devuelve el logo de la empresa', async () => {
    const repo = new RepositorioMarcaMemoria();
    const almacen = new AlmacenFake();
    const logoId = await almacen.guardar('e1', BYTES);
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId }));
    expect(await new ObtenerLogo(repo, almacen).ejecutar('e1')).toEqual(BYTES);
  });

  it('devuelve null si no hay marca', async () => {
    expect(await new ObtenerLogo(new RepositorioMarcaMemoria(), new AlmacenFake()).ejecutar('e1')).toBeNull();
  });

  it('devuelve null si la marca no tiene logo', async () => {
    const repo = new RepositorioMarcaMemoria();
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb' }));
    expect(await new ObtenerLogo(repo, new AlmacenFake()).ejecutar('e1')).toBeNull();
  });

  it('devuelve null si el archivo ya no existe', async () => {
    const repo = new RepositorioMarcaMemoria();
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId: 'fantasma' }));
    expect(await new ObtenerLogo(repo, new AlmacenFake()).ejecutar('e1')).toBeNull();
  });

  it('no entrega el logo de otra empresa aunque la marca apunte a su archivo', async () => {
    const repo = new RepositorioMarcaMemoria();
    const almacen = new AlmacenFake();
    const logoDeE1 = await almacen.guardar('e1', BYTES);
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e2', colorPrimario: '#2563eb', logoId: logoDeE1 }));
    expect(await new ObtenerLogo(repo, almacen).ejecutar('e2')).toBeNull();
  });

  it('una empresa sin marca no ve el logo de otra', async () => {
    const repo = new RepositorioMarcaMemoria();
    const almacen = new AlmacenFake();
    const logoId = await almacen.guardar('e1', BYTES);
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId }));
    expect(await new ObtenerLogo(repo, almacen).ejecutar('e2')).toBeNull();
  });
});
