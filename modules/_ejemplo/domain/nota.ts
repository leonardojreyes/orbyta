export class TituloInvalidoError extends Error {
  constructor() {
    super('El título de la nota no puede estar vacío');
    this.name = 'TituloInvalidoError';
  }
}

export class Nota {
  private constructor(
    readonly id: string,
    readonly empresaId: string,
    readonly titulo: string,
  ) {}

  static crear(datos: { id: string; empresaId: string; titulo: string }): Nota {
    const titulo = datos.titulo.trim();
    if (!titulo) throw new TituloInvalidoError();
    return new Nota(datos.id, datos.empresaId, titulo);
  }
}
