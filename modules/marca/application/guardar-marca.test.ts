import { beforeEach, describe, expect, it } from 'vitest';
import type { AlmacenArchivos } from '@orbyta/archivos';
import { ColorInvalidoError, ColorNoAccesibleError, MarcaEmpresa } from '../domain/marca';
import { LogoDemasiadoGrandeError, LogoInvalidoError } from '../domain/logo';
import { RepositorioMarcaMemoria } from '../infrastructure/repositorio-marca-memoria';
import { GuardarMarca } from './guardar-marca';

/** Almacén en memoria separado por empresa, con registro de operaciones y fallos inyectables. */
class AlmacenFake implements AlmacenArchivos {
  readonly datos = new Map<string, Map<string, Uint8Array>>();
  readonly operaciones: string[] = [];
  fallarAlGuardar = false;
  private n = 0;

  async guardar(empresaId: string, contenido: Uint8Array): Promise<string> {
    this.operaciones.push('guardar');
    if (this.fallarAlGuardar) throw new Error('fallo del almacén');
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
    this.operaciones.push('eliminar');
    return this.datos.get(empresaId)?.delete(archivoId) ?? false;
  }

  ids(empresaId: string): string[] {
    return [...(this.datos.get(empresaId)?.keys() ?? [])];
  }
}

class RepositorioQueFalla extends RepositorioMarcaMemoria {
  fallar = false;
  override async guardar(marca: MarcaEmpresa): Promise<void> {
    if (this.fallar) throw new Error('fallo de la base');
    await super.guardar(marca);
  }
}

const FIRMA = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const png = (tamano = 50, relleno = 0): Uint8Array => {
  const b = new Uint8Array(tamano).fill(relleno);
  b.set(FIRMA);
  return b;
};

describe('GuardarMarca', () => {
  let repo: RepositorioQueFalla;
  let almacen: AlmacenFake;
  let caso: GuardarMarca;

  beforeEach(() => {
    repo = new RepositorioQueFalla();
    almacen = new AlmacenFake();
    caso = new GuardarMarca(repo, almacen);
  });

  it('guarda color y logo nuevo', async () => {
    const logo = png(60, 7);
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo });
    const marca = await repo.obtener('e1');
    expect(marca?.colorPrimario).toBe('#2563eb');
    expect(marca?.logoId).toBeDefined();
    expect(await almacen.leer('e1', marca!.logoId!)).toEqual(logo);
  });

  it('guarda solo el color si no hay logo', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb' });
    const marca = await repo.obtener('e1');
    expect(marca?.colorPrimario).toBe('#2563eb');
    expect(marca?.logoId).toBeUndefined();
    expect(almacen.operaciones).toEqual([]);
  });

  it('sin logo nuevo conserva el logo actual', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png() });
    const antes = (await repo.obtener('e1'))!.logoId;
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#1d4ed8' });
    const despues = await repo.obtener('e1');
    expect(despues?.colorPrimario).toBe('#1d4ed8');
    expect(despues?.logoId).toBe(antes);
    expect(almacen.ids('e1')).toEqual([antes]);
  });

  it('al reemplazar el logo borra el anterior', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(50, 1) });
    const anterior = (await repo.obtener('e1'))!.logoId!;
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(50, 2) });
    const nuevo = (await repo.obtener('e1'))!.logoId!;
    expect(nuevo).not.toBe(anterior);
    expect(almacen.ids('e1')).toEqual([nuevo]);
  });

  it('si falla la fila borra el archivo nuevo, relanza el error y conserva el logo anterior', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(50, 1) });
    const anterior = (await repo.obtener('e1'))!.logoId!;
    repo.fallar = true;
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#1d4ed8', logo: png(50, 2) }),
    ).rejects.toThrow('fallo de la base');
    expect(almacen.ids('e1')).toEqual([anterior]);
    const marca = await repo.obtener('e1');
    expect(marca?.logoId).toBe(anterior);
    expect(marca?.colorPrimario).toBe('#2563eb');
  });

  it('si falla la fila en la primera marca no deja archivos huérfanos', async () => {
    repo.fallar = true;
    await expect(caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png() })).rejects.toThrow();
    expect(almacen.ids('e1')).toEqual([]);
  });

  it('si falla el almacén no guarda la fila y relanza el error', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb' });
    almacen.fallarAlGuardar = true;
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#1d4ed8', logo: png() }),
    ).rejects.toThrow('fallo del almacén');
    expect((await repo.obtener('e1'))?.colorPrimario).toBe('#2563eb');
  });

  it('rechaza un color no accesible sin efectos', async () => {
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#ffff00', logo: png() }),
    ).rejects.toThrow(ColorNoAccesibleError);
    expect(almacen.operaciones).toEqual([]);
    expect(await repo.obtener('e1')).toBeNull();
  });

  it('rechaza un color con formato inválido sin efectos', async () => {
    await expect(caso.ejecutar({ empresaId: 'e1', colorPrimario: 'azul', logo: png() })).rejects.toThrow(
      ColorInvalidoError,
    );
    expect(almacen.operaciones).toEqual([]);
  });

  it('rechaza un logo que no es PNG antes de tocar el almacén', async () => {
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: new Uint8Array([1, 2, 3]) }),
    ).rejects.toThrow(LogoInvalidoError);
    expect(almacen.operaciones).toEqual([]);
    expect(await repo.obtener('e1')).toBeNull();
  });

  it('rechaza un logo mayor de 256 KB antes de tocar el almacén', async () => {
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(256 * 1024 + 1) }),
    ).rejects.toThrow(LogoDemasiadoGrandeError);
    expect(almacen.operaciones).toEqual([]);
  });

  it('un logo inválido no altera la marca ni el logo existentes', async () => {
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png() });
    const antes = await repo.obtener('e1');
    await expect(
      caso.ejecutar({ empresaId: 'e1', colorPrimario: '#1d4ed8', logo: new Uint8Array(4) }),
    ).rejects.toThrow(LogoInvalidoError);
    expect(await repo.obtener('e1')).toEqual(antes);
    expect(almacen.ids('e1')).toEqual([antes!.logoId]);
  });

  it('no afecta la marca ni los archivos de otra empresa', async () => {
    await caso.ejecutar({ empresaId: 'e2', colorPrimario: '#1d4ed8', logo: png(50, 9) });
    const marcaE2 = await repo.obtener('e2');
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(50, 1) });
    await caso.ejecutar({ empresaId: 'e1', colorPrimario: '#2563eb', logo: png(50, 2) });
    expect(await repo.obtener('e2')).toEqual(marcaE2);
    expect(almacen.ids('e2')).toEqual([marcaE2!.logoId]);
    expect(almacen.ids('e1')).toHaveLength(1);
  });
});
