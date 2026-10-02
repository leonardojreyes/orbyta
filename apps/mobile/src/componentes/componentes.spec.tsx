import { fireEvent, render, screen } from '@testing-library/react-native';
import { ordenesEjemplo } from '@orbyta/ui/ejemplos';
import { Aviso } from './aviso';
import { BannerConexion } from './banner-conexion';
import { Boton } from './boton';
import { Campo } from './campo';
import { ChipEstado } from './chip-estado';
import { TarjetaOrden } from './tarjeta-orden';
import { ProveedorTema } from './tema';

const conTema = (ui: React.ReactElement) =>
  render(<ProveedorTema>{ui}</ProveedorTema>);

describe('Boton', () => {
  it('es un botón accesible que responde al toque', () => {
    const alPulsar = jest.fn();
    conTema(<Boton etiqueta="Guardar" onPress={alPulsar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(alPulsar).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado no responde y lo declara', () => {
    const alPulsar = jest.fn();
    conTema(<Boton etiqueta="Guardar" disabled onPress={alPulsar} />);
    const boton = screen.getByRole('button', { name: 'Guardar' });
    expect(boton).toBeDisabled();
    fireEvent.press(boton);
    expect(alPulsar).not.toHaveBeenCalled();
  });

  it('usa el alto táctil mínimo de 48 (56 el principal) mediante tokens', () => {
    conTema(<Boton etiqueta="Cerrar orden" principal />);
    expect(
      screen.getByRole('button', { name: 'Cerrar orden' }).props.className ??
        '',
    ).toContain('min-h-tactil-movil-principal');
  });
});

describe('Campo', () => {
  it('muestra etiqueta, ayuda y error accesibles', () => {
    conTema(
      <Campo etiqueta="Usuario" ayuda="Tu usuario" error="Es obligatorio" />,
    );
    expect(screen.getByLabelText('Usuario')).toBeTruthy();
    expect(screen.getByText('Tu usuario')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Es obligatorio');
  });

  it('propaga el texto escrito', () => {
    const alCambiar = jest.fn();
    conTema(<Campo etiqueta="Usuario" onChangeText={alCambiar} />);
    fireEvent.changeText(screen.getByLabelText('Usuario'), 'tecnico1');
    expect(alCambiar).toHaveBeenCalledWith('tecnico1');
  });
});

describe('ChipEstado', () => {
  it.each([
    ['registrada', 'Registrada'],
    ['en_curso', 'En curso'],
    ['cerrada', 'Cerrada'],
    ['en_riesgo', 'En riesgo'],
    ['vencida', 'Vencida'],
  ] as const)('muestra el texto de %s (no solo color)', (estado, texto) => {
    conTema(<ChipEstado estado={estado} />);
    expect(screen.getByText(texto)).toBeTruthy();
    expect(screen.getByLabelText(texto)).toBeTruthy();
  });
});

describe('Aviso y banner de conexión', () => {
  it('el aviso de error se anuncia como alerta', () => {
    conTema(<Aviso tipo="error" texto="No se pudo guardar" />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar');
  });

  it('el banner indica sin conexión y los cambios pendientes', () => {
    conTema(<BannerConexion pendientes={3} />);
    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByText(/3 cambios por sincronizar/)).toBeTruthy();
  });
});

describe('TarjetaOrden', () => {
  it('abre el detalle con un toque y describe la orden', () => {
    const alAbrir = jest.fn();
    const orden = ordenesEjemplo[0]!;
    conTema(<TarjetaOrden orden={orden} alAbrir={alAbrir} />);
    fireEvent.press(
      screen.getByRole('button', { name: new RegExp(orden.numero) }),
    );
    expect(alAbrir).toHaveBeenCalled();
  });
});
