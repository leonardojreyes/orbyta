import { describe, expect, it } from 'vitest';
import { COLOR_PRIMARIO_PREDETERMINADO, MarcaEmpresa } from '../domain/marca';
import type { RepositorioMarca } from '../domain/repositorio-marca';
import { RepositorioMarcaMemoria } from '../infrastructure/repositorio-marca-memoria';
import { ObtenerMarca } from './obtener-marca';

describe('ObtenerMarca', () => {
  it('devuelve la marca predeterminada si la empresa no tiene marca', async () => {
    const r = await new ObtenerMarca(new RepositorioMarcaMemoria()).ejecutar('e1');
    expect(r).toEqual({ colorPrimario: COLOR_PRIMARIO_PREDETERMINADO, tieneLogo: false });
  });

  it('devuelve el color guardado y si tiene logo', async () => {
    const repo = new RepositorioMarcaMemoria();
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId: 'l1' }));
    expect(await new ObtenerMarca(repo).ejecutar('e1')).toEqual({ colorPrimario: '#2563eb', tieneLogo: true });
  });

  it('indica que no hay logo si la marca no lo tiene', async () => {
    const repo = new RepositorioMarcaMemoria();
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb' }));
    expect((await new ObtenerMarca(repo).ejecutar('e1')).tieneLogo).toBe(false);
  });

  it('no muestra la marca de otra empresa', async () => {
    const repo = new RepositorioMarcaMemoria();
    await repo.guardar(MarcaEmpresa.crear({ empresaId: 'e1', colorPrimario: '#2563eb', logoId: 'l1' }));
    const r = await new ObtenerMarca(repo).ejecutar('e2');
    expect(r).toEqual({ colorPrimario: COLOR_PRIMARIO_PREDETERMINADO, tieneLogo: false });
  });

  it('devuelve el predeterminado si el color guardado no cumple AA', async () => {
    const invalida = Object.assign(Object.create(MarcaEmpresa.prototype), {
      empresaId: 'e1',
      colorPrimario: '#ffff00',
      logoId: 'l1',
    }) as MarcaEmpresa;
    const repo: RepositorioMarca = {
      obtener: async () => invalida,
      guardar: async () => undefined,
    };
    const r = await new ObtenerMarca(repo).ejecutar('e1');
    expect(r.colorPrimario).toBe(COLOR_PRIMARIO_PREDETERMINADO);
  });
});
