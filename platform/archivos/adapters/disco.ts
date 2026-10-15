import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IdentificadorInvalidoError, type AlmacenArchivos } from '../port';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Disco local: `<raíz>/<empresaId>/<archivoId>`. Los UUID validados impiden salir de la raíz. */
export class AlmacenArchivosDisco implements AlmacenArchivos {
  constructor(private readonly raiz: string) {}

  private ruta(empresaId: string, archivoId?: string): string {
    if (!UUID.test(empresaId)) throw new IdentificadorInvalidoError('empresa');
    if (archivoId === undefined) return join(this.raiz, empresaId);
    if (!UUID.test(archivoId)) throw new IdentificadorInvalidoError('archivo');
    return join(this.raiz, empresaId, archivoId);
  }

  async guardar(empresaId: string, contenido: Uint8Array): Promise<string> {
    const directorio = this.ruta(empresaId);
    const id = randomUUID();
    await mkdir(directorio, { recursive: true });
    await writeFile(join(directorio, id), contenido, { flag: 'wx' });
    return id;
  }

  async leer(empresaId: string, archivoId: string): Promise<Uint8Array | null> {
    try {
      return new Uint8Array(await readFile(this.ruta(empresaId, archivoId)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async eliminar(empresaId: string, archivoId: string): Promise<boolean> {
    const ruta = this.ruta(empresaId, archivoId);
    if ((await this.leer(empresaId, archivoId)) === null) return false;
    await rm(ruta);
    return true;
  }
}
