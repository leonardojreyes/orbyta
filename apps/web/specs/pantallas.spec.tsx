import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ordenesEjemplo } from '@orbyta/ui/ejemplos';
import { DetalleOrden } from '../src/componentes/detalle-orden';
import { FormularioLogin } from '../src/componentes/formulario-login';
import { FormularioOrden } from '../src/componentes/formulario-orden';
import { PanelResumen } from '../src/componentes/panel-resumen';
import { VistaOrdenes } from '../src/componentes/vista-ordenes';
import { ConmutadorTema } from '../src/componentes/conmutador-tema';
import { Armazon } from '../src/componentes/armazon';

const empujar = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: empujar }),
  usePathname: () => '/ordenes',
}));

const sinViolaciones = async (el: HTMLElement) =>
  expect(await axe(el)).toHaveNoViolations();

beforeEach(() => empujar.mockClear());

describe('Inicio de sesión', () => {
  it('es accesible', async () => {
    const { container } = render(<FormularioLogin />);
    await sinViolaciones(container);
  });

  it('muestra errores si faltan datos y no navega', async () => {
    render(<FormularioLogin />);
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getAllByText('Este campo es obligatorio.')).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent(/incorrectos/);
    expect(empujar).not.toHaveBeenCalled();
  });

  it('entra al panel con datos', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/Usuario/), 'tecnico1');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(empujar).toHaveBeenCalledWith('/');
  });
});

describe('Panel', () => {
  it('resume las órdenes y es accesible', async () => {
    const { container } = render(<PanelResumen />);
    expect(
      screen.getByRole('heading', { name: 'Panel', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total de órdenes')).toBeInTheDocument();
    await sinViolaciones(container);
  });
});

describe('Listado de órdenes', () => {
  it('muestra la lista, cambia a tablero y vuelve', async () => {
    const { container } = render(<VistaOrdenes />);
    expect(
      screen.getByRole('table', { name: 'Órdenes de servicio' }),
    ).toBeInTheDocument();
    await sinViolaciones(container);
    await userEvent.click(screen.getByRole('button', { name: 'Tablero' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'En curso' }),
    ).toBeInTheDocument();
    await sinViolaciones(container);
    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('mueve una orden de columna sin arrastrar', async () => {
    render(<VistaOrdenes />);
    await userEvent.click(screen.getByRole('button', { name: 'Tablero' }));
    const registrada = screen.getByRole('region', { name: 'Registrada' });
    const antes = within(registrada).getAllByRole('article').length;
    await userEvent.selectOptions(
      within(registrada).getAllByLabelText('Mover a')[0] as HTMLElement,
      'cerrada',
    );
    expect(
      within(screen.getByRole('region', { name: 'Registrada' })).getAllByRole(
        'article',
      ),
    ).toHaveLength(antes - 1);
  });

  it('abre el detalle en un panel lateral y lo cierra con Esc', async () => {
    render(<VistaOrdenes />);
    await userEvent.dblClick(screen.getAllByRole('row')[1] as HTMLElement);
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText(/Historial/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Formulario de orden', () => {
  it('es accesible y valida los campos obligatorios', async () => {
    const { container } = render(<FormularioOrden />);
    await sinViolaciones(container);
    await userEvent.click(screen.getByRole('button', { name: 'Crear orden' }));
    expect(
      screen.getAllByText('Este campo es obligatorio.').length,
    ).toBeGreaterThanOrEqual(3);
    expect(empujar).not.toHaveBeenCalled();
  });

  it('crea la orden con los datos mínimos', async () => {
    render(<FormularioOrden />);
    await userEvent.type(screen.getByLabelText(/^Abonado/), 'Abonado 0001');
    await userEvent.type(
      screen.getByLabelText(/Descripción/),
      'Fuga en la acera',
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Tipo de falla'),
      'Fuga de agua',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Crear orden' }));
    expect(empujar).toHaveBeenCalledWith('/ordenes');
  });
});

describe('Detalle de orden', () => {
  it('muestra los datos y el historial, y es accesible', async () => {
    const orden = ordenesEjemplo[0]!;
    const { container } = render(<DetalleOrden orden={orden} />);
    expect(screen.getByText(orden.puntoServicio)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Historial' }),
    ).toBeInTheDocument();
    await sinViolaciones(container);
  });
});

describe('Armazón de la aplicación', () => {
  it('muestra la navegación, abre la paleta con Ctrl+K y es accesible', async () => {
    const { container } = render(
      <Armazon>
        <h1>Contenido</h1>
      </Armazon>,
    );
    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Órdenes de servicio/ }),
    ).toHaveAttribute('aria-current', 'page');
    await sinViolaciones(container);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('el conmutador de tema fuerza el tema oscuro y lo recuerda', async () => {
    render(<ConmutadorTema />);
    await userEvent.click(screen.getByRole('button', { name: /Cambiar tema/ }));
    expect(document.documentElement.dataset['theme']).toBe('oscuro');
    expect(localStorage.getItem('orbyta-tema')).toBe('oscuro');
  });
});
