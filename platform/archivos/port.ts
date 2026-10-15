/** Almacén de archivos separado por empresa. Un identificador de otra empresa nunca resuelve. */
export interface AlmacenArchivos {
  /** Guarda el contenido y devuelve su identificador (UUID generado por el almacén). */
  guardar(empresaId: string, contenido: Uint8Array): Promise<string>;
  /** Contenido del archivo, o `null` si no existe en esa empresa. */
  leer(empresaId: string, archivoId: string): Promise<Uint8Array | null>;
  /** Elimina el archivo; devuelve si existía. */
  eliminar(empresaId: string, archivoId: string): Promise<boolean>;
}

export class IdentificadorInvalidoError extends Error {
  constructor(campo: 'empresa' | 'archivo') {
    super(`Identificador de ${campo} inválido`);
    this.name = 'IdentificadorInvalidoError';
  }
}
