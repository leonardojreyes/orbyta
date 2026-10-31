import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import type { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { env } from "./env.js";

/**
 * Almacenamiento de archivos. El resto de la API solo conoce esta interfaz y claves de texto
 * ("<empresa>/<orden>/<id>.<ext>", generadas por el servidor); no sabe si el archivo está en disco o en S3.
 * Para pasar a S3: implementar `Storage` con PutObject / GetObject (la clave es la clave del objeto) y elegirla
 * en `createStorage` con STORAGE_DRIVER=s3. No cambia ninguna ruta ni la base de datos.
 */
export interface Storage {
  put(key: string, data: Buffer): Promise<void>;
  /** Devuelve el archivo como flujo, o undefined si no existe. */
  get(key: string): Promise<{ stream: Readable; size: number } | undefined>;
  /** Solo para limpiar una subida cuyo registro no se pudo guardar; los adjuntos "borrados" por el usuario conservan su archivo. */
  remove(key: string): Promise<void>;
}

class LocalDiskStorage implements Storage {
  constructor(private readonly baseDir: string) {}

  /** Ruta dentro del directorio base; rechaza cualquier clave que intente salirse de él. */
  private path(key: string) {
    const full = resolve(this.baseDir, key);
    if (!full.startsWith(this.baseDir + sep)) throw new Error("Clave de almacenamiento inválida");
    return full;
  }

  async put(key: string, data: Buffer) {
    const full = this.path(key);
    await mkdir(dirname(full), { recursive: true });
    const tmp = `${full}.${randomUUID()}.tmp`; // se escribe aparte y se renombra: nunca queda un archivo a medias
    await writeFile(tmp, data, { flag: "wx" });
    await rename(tmp, full);
  }

  async get(key: string) {
    const full = this.path(key);
    const info = await stat(full).catch(() => undefined);
    return info?.isFile() ? { stream: createReadStream(full), size: info.size } : undefined;
  }

  async remove(key: string) {
    await rm(this.path(key), { force: true });
  }
}

export function createStorage(): Storage {
  if (env.STORAGE_DRIVER === "local") return new LocalDiskStorage(env.STORAGE_DIR);
  throw new Error(`STORAGE_DRIVER "${env.STORAGE_DRIVER}" no soportado (disponible: local)`);
}
