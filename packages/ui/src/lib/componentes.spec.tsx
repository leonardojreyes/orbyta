import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Home } from 'lucide-react';
import {
  Aviso,
  Avatar,
  BarraLateral,
  Boton,
  Campo,
  CampoFecha,
  Casilla,
  ChipEstado,
  Insignia,
  LogoEmpresa,
  LogoOrbyta,
  Modal,
  PaletaComandos,
  PanelLateral,
  Selector,
  TablaDensa,
  TarjetaTablero,
  iniciales,
  useAtajoPaleta,
  type EstadoChip,
} from '../index';

const sinViolaciones = async (contenedor: HTMLElement) =>
  expect(await axe(contenedor)).toHaveNoViolations();

describe('Boton', () => {
  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Boton>Guardar</Boton>);
    await sinViolaciones(container);
  });

  it('en estado cargando se deshabilita, anuncia la carga y no dispara clics', async () => {
    const alClic = jest.fn();
    render(
      <Boton cargando onClick={alClic}>
        Guardar
      </Boton>,
    );
    const boton = screen.getByRole('button', { name: /guardar/i });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(boton);
    expect(alClic).not.toHaveBeenCalled();
  });

  it('dispara el clic cuando está habilitado', async () => {
    const alClic = jest.fn();
    render(<Boton onClick={alClic}>Aceptar</Boton>);
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));
    expect(alClic).toHaveBeenCalledTimes(1);
  });
});

describe('Campo y CampoFecha', () => {
  it('enlaza etiqueta, ayuda y error, y marca el campo como inválido', async () => {
    const { container } = render(
      <Campo etiqueta="Usuario" ayuda="Tu usuario" error="Es obligatorio" />,
    );
    const campo = screen.getByLabelText('Usuario');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Tu usuario Es obligatorio');
    await sinViolaciones(container);
  });

  it('indica los campos opcionales', () => {
    render(<Campo etiqueta="Ubicación" opcional />);
    expect(screen.getByText(/opcional/)).toBeInTheDocument();
  });

  it('el campo de fecha es de tipo date y accesible', async () => {
    const { container } = render(<CampoFecha etiqueta="Fecha programada" />);
    expect(screen.getByLabelText('Fecha programada')).toHaveAttribute(
      'type',
      'date',
    );
    await sinViolaciones(container);
  });
});

describe('Selector', () => {
  const pocas = [
    { valor: 'a', etiqueta: 'Fuga de agua' },
    { valor: 'b', etiqueta: 'Sin servicio' },
  ];
  const muchas = Array.from({ length: 9 }, (_, i) => ({
    valor: `v${i}`,
    etiqueta: `Opción ${i + 1}`,
  }));

  it('usa una lista nativa accesible con pocas opciones', async () => {
    const alCambiar = jest.fn();
    const { container } = render(
      <Selector
        etiqueta="Tipo de falla"
        opciones={pocas}
        valor=""
        onCambio={alCambiar}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Tipo de falla'), 'b');
    expect(alCambiar).toHaveBeenCalledWith('b');
    await sinViolaciones(container);
  });

  it('ofrece búsqueda con más de 7 opciones', async () => {
    const alCambiar = jest.fn();
    render(
      <Selector
        etiqueta="Abonado"
        opciones={muchas}
        valor=""
        onCambio={alCambiar}
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Abonado' }));
    await userEvent.type(screen.getByPlaceholderText('Buscar'), 'Opción 9');
    await userEvent.click(await screen.findByText('Opción 9'));
    expect(alCambiar).toHaveBeenCalledWith('v8');
  });
});

describe('Casilla', () => {
  it('alterna y es accesible', async () => {
    const alCambiar = jest.fn();
    const { container } = render(
      <Casilla
        etiqueta="Aceptar términos"
        marcada={false}
        onCambio={alCambiar}
      />,
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Aceptar términos' }),
    );
    expect(alCambiar).toHaveBeenCalledWith(true);
    await sinViolaciones(container);
  });

  it('soporta el estado intermedio', () => {
    render(
      <Casilla
        etiqueta="Todas"
        marcada="indeterminada"
        onCambio={() => undefined}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Todas' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });
});

describe('ChipEstado', () => {
  const estados: [EstadoChip, string][] = [
    ['registrada', 'Registrada'],
    ['en_curso', 'En curso'],
    ['cerrada', 'Cerrada'],
    ['en_riesgo', 'En riesgo'],
    ['vencida', 'Vencida'],
  ];
  it.each(estados)(
    'muestra texto para %s (no depende solo del color)',
    async (estado, texto) => {
      const { container } = render(<ChipEstado estado={estado} />);
      expect(screen.getByText(texto)).toBeInTheDocument();
      await sinViolaciones(container);
    },
  );
});

describe('Avatar, Insignia, Aviso y LogoEmpresa', () => {
  it('calcula iniciales', () => {
    expect(iniciales('Ana María Pérez')).toBe('AM');
    expect(iniciales('')).toBe('');
  });

  it('el avatar expone el nombre', async () => {
    const { container } = render(<Avatar nombre="Ana Pérez" />);
    expect(screen.getByRole('img', { name: 'Ana Pérez' })).toBeInTheDocument();
    await sinViolaciones(container);
  });

  it('la insignia muestra su contenido', async () => {
    const { container } = render(<Insignia variante="primaria">3</Insignia>);
    expect(screen.getByText('3')).toBeInTheDocument();
    await sinViolaciones(container);
  });

  it.each([
    ['exito', 'status'],
    ['info', 'status'],
    ['advertencia', 'alert'],
    ['error', 'alert'],
  ] as const)('el aviso %s se anuncia como %s', async (tipo, rol) => {
    const alCerrar = jest.fn();
    const { container } = render(
      <Aviso tipo={tipo} titulo="Título" onCerrar={alCerrar}>
        Mensaje
      </Aviso>,
    );
    expect(screen.getByRole(rol)).toHaveTextContent('Mensaje');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(alCerrar).toHaveBeenCalled();
    await sinViolaciones(container);
  });

  it('el logo cae al nombre cuando no hay imagen', () => {
    render(<LogoEmpresa nombre="Agua Quito" />);
    expect(screen.getByText('Agua Quito')).toBeInTheDocument();
  });

  it('el logo de Orbyta apunta al archivo de marca y tiene texto alternativo', () => {
    render(<LogoOrbyta />);
    const logo = screen.getByRole('img', { name: 'Orbyta' });
    expect(logo).toHaveAttribute('src', '/marca/orbyta-logo.svg');
  });

  it('el logo con imagen tiene texto alternativo', () => {
    render(<LogoEmpresa nombre="Agua Quito" src="/logo.svg" />);
    expect(screen.getByRole('img', { name: /Agua Quito/ })).toBeInTheDocument();
  });
});

interface Fila {
  id: string;
  numero: number;
  descripcion: string;
}
const filas: Fila[] = [
  { id: 'a', numero: 3, descripcion: 'Fuga' },
  { id: 'b', numero: 1, descripcion: 'Sin agua' },
  { id: 'c', numero: 2, descripcion: 'Presión' },
];
const columnas = [
  {
    id: 'numero',
    encabezado: 'N.º',
    celda: (f: Fila) => f.numero,
    valorOrden: (f: Fila) => f.numero,
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción',
    celda: (f: Fila) => f.descripcion,
  },
];

describe('TablaDensa', () => {
  it('es accesible y ordena por columna', async () => {
    const { container } = render(
      <TablaDensa
        descripcion="Órdenes"
        columnas={columnas}
        filas={filas}
        idFila={(f) => f.id}
      />,
    );
    await sinViolaciones(container);
    const celdas = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((r) => within(r).getAllByRole('cell')[0]?.textContent);
    expect(celdas()).toEqual(['3', '1', '2']);
    await userEvent.click(screen.getByRole('button', { name: /N\.º/ }));
    expect(celdas()).toEqual(['1', '2', '3']);
    expect(screen.getByRole('columnheader', { name: /N\.º/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(screen.getByRole('button', { name: /N\.º/ }));
    expect(celdas()).toEqual(['3', '2', '1']);
    await userEvent.click(screen.getByRole('button', { name: /N\.º/ }));
    expect(celdas()).toEqual(['3', '1', '2']);
  });

  it('permite seleccionar filas y todas a la vez', async () => {
    const Envoltorio = () => {
      const [sel, setSel] = useState<Set<string>>(new Set());
      return (
        <TablaDensa
          descripcion="Órdenes"
          columnas={columnas}
          filas={filas}
          idFila={(f) => f.id}
          seleccionadas={sel}
          onSeleccion={setSel}
        />
      );
    };
    render(<Envoltorio />);
    await userEvent.click(
      screen.getAllByRole('checkbox', {
        name: 'Seleccionar fila',
      })[0] as HTMLElement,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Seleccionar todo' }),
    ).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Seleccionar todo' }),
    );
    expect(
      screen
        .getAllByRole('checkbox', { name: 'Seleccionar fila' })
        .every((c) => c.getAttribute('aria-checked') === 'true'),
    ).toBe(true);
  });

  it('navega con flechas y abre con Enter', async () => {
    const alAbrir = jest.fn();
    render(
      <TablaDensa
        descripcion="Órdenes"
        columnas={columnas}
        filas={filas}
        idFila={(f) => f.id}
        onAbrir={alAbrir}
      />,
    );
    const filasDom = screen.getAllByRole('row').slice(1);
    filasDom[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(filasDom[1]).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(alAbrir).toHaveBeenCalledWith(filas[1]);
  });
});

describe('TarjetaTablero', () => {
  it('muestra los datos y ofrece mover sin arrastrar', async () => {
    const alMover = jest.fn();
    const { container } = render(
      <TarjetaTablero
        titulo="OS-001 Fuga en calle 10"
        estado="en_riesgo"
        responsable="Ana Pérez"
        plazo="Vence 05/10/2026"
        destinos={[{ valor: 'cerrada', etiqueta: 'Cerrada' }]}
        onMover={alMover}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Mover a'), 'cerrada');
    expect(alMover).toHaveBeenCalledWith('cerrada');
    expect(screen.getByText('En riesgo')).toBeInTheDocument();
    await sinViolaciones(container);
  });
});

describe('Modal y PanelLateral', () => {
  it('el modal cierra con Esc y es accesible', async () => {
    const alCambiar = jest.fn();
    render(
      <Modal
        abierto
        onCambio={alCambiar}
        titulo="Cerrar orden"
        descripcion="Esta acción no se puede deshacer"
      >
        <p>Contenido</p>
      </Modal>,
    );
    const dialogo = screen.getByRole('dialog', { name: 'Cerrar orden' });
    expect(dialogo).toHaveAccessibleDescription(
      'Esta acción no se puede deshacer',
    );
    await sinViolaciones(dialogo);
    await userEvent.keyboard('{Escape}');
    expect(alCambiar).toHaveBeenCalledWith(false);
  });

  it('el panel lateral se puede cerrar con el botón', async () => {
    const alCambiar = jest.fn();
    render(
      <PanelLateral abierto onCambio={alCambiar} titulo="Detalle">
        <p>Contenido</p>
      </PanelLateral>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(alCambiar).toHaveBeenCalledWith(false);
  });
});

describe('BarraLateral', () => {
  const items = [
    { id: 'inicio', etiqueta: 'Inicio', icono: Home, activo: true },
    {
      id: 'p',
      etiqueta: 'Proyectos',
      hijos: [{ id: 'p1', etiqueta: 'Red norte', contador: 4 }],
    },
  ];

  it('marca la página actual, muestra la jerarquía y es accesible', async () => {
    const { container } = render(
      <BarraLateral
        logo={<LogoEmpresa nombre="Agua Quito" />}
        items={items}
        colapsada={false}
        onAlternar={() => undefined}
      />,
    );
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: /Red norte/ })).toBeInTheDocument();
    await sinViolaciones(container);
  });

  it('colapsada deja solo iconos con nombre accesible y alterna', async () => {
    const alAlternar = jest.fn();
    const { container } = render(
      <BarraLateral
        logo={null}
        items={items}
        colapsada
        onAlternar={alAlternar}
      />,
    );
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.queryByText('Red norte')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Expandir barra lateral' }),
    );
    expect(alAlternar).toHaveBeenCalled();
    await sinViolaciones(container);
  });
});

describe('PaletaComandos', () => {
  const Prueba = ({ ejecutar }: { ejecutar: () => void }) => {
    const [abierta, setAbierta] = useState(false);
    useAtajoPaleta(() => setAbierta(true));
    return (
      <PaletaComandos
        abierta={abierta}
        onCambio={setAbierta}
        comandos={[
          { id: 'nueva', grupo: 'Acciones', etiqueta: 'Nueva orden', ejecutar },
          {
            id: 'ir',
            grupo: 'Navegación',
            etiqueta: 'Ir a proyectos',
            ejecutar: () => undefined,
          },
        ]}
      />
    );
  };

  it('se abre con Ctrl+K, filtra y ejecuta con Enter', async () => {
    const ejecutar = jest.fn();
    render(<Prueba ejecutar={ejecutar} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.type(
      screen.getByPlaceholderText(/Escribe un comando/),
      'nueva',
    );
    await userEvent.keyboard('{Enter}');
    expect(ejecutar).toHaveBeenCalledTimes(1);
  });

  it('se abre con Cmd+K', async () => {
    render(<Prueba ejecutar={() => undefined} />);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
