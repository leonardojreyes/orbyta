import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { IdentificadorInvalidoError, type AlmacenArchivos } from './port';
import { AlmacenArchivosDisco } from './adapters/disco';

const directorios: string[] = [];
const temporal = async () => {
  const d = await mkdtemp(join(tmpdir(), 'orbyta-archivos-'));
  directorios.push(d);
  return d;
};
afterAll(() => Promise.all(directorios.map((d) => rm(d, { recursive: true, force: true }))));

// Todo adaptador de AlmacenArchivos, actual o futuro, debe pasar este contrato.
const adaptadores: Array<[string, () => Promise<AlmacenArchivos>]> = [
  ['disco', async () => new AlmacenArchivosDisco(await temporal())],
];

describe.each(adaptadores)('contrato AlmacenArchivos — %s', (_nombre, crear) => {
  const bytes = new TextEncoder().encode('contenido reservado');

  it('guarda y lee el mismo contenido', async () => {
    const almacen = await crear();
    const empresa = randomUUID();
    const id = await almacen.guardar(empresa, bytes);
    expect(await almacen.leer(empresa, id)).toEqual(bytes);
  });

  it('la empresa B no puede leer ni eliminar un archivo de la empresa A', async () => {
    const almacen = await crear();
    const a = randomUUID();
    const b = randomUUID();
    const id = await almacen.guardar(a, bytes);
    expect(await almacen.leer(b, id)).toBeNull();
    expect(await almacen.eliminar(b, id)).toBe(false);
    expect(await almacen.leer(a, id)).toEqual(bytes);
  });

  it('elimina el archivo y lo deja de encontrar', async () => {
    const almacen = await crear();
    const empresa = randomUUID();
    const id = await almacen.guardar(empresa, bytes);
    expect(await almacen.eliminar(empresa, id)).toBe(true);
    expect(await almacen.leer(empresa, id)).toBeNull();
    expect(await almacen.eliminar(empresa, id)).toBe(false);
  });

  it('rechaza empresa o archivo que no son UUID (sin salir de la raíz)', async () => {
    const almacen = await crear();
    const empresa = randomUUID();
    await expect(almacen.guardar('../fuera', bytes)).rejects.toBeInstanceOf(IdentificadorInvalidoError);
    await expect(almacen.leer(empresa, '../../etc/passwd')).rejects.toBeInstanceOf(IdentificadorInvalidoError);
    await expect(almacen.eliminar(empresa, '..')).rejects.toBeInstanceOf(IdentificadorInvalidoError);
  });
});
