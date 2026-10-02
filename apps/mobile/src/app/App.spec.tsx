import { fireEvent, render, screen } from '@testing-library/react-native';
import App from './App';

const ingresar = () => {
  fireEvent.changeText(screen.getByLabelText('Usuario'), 'tecnico1');
  fireEvent.changeText(screen.getByLabelText('Contraseña'), 'x');
  fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
};

describe('App móvil', () => {
  it('muestra el inicio de sesión y valida los campos', () => {
    render(<App />);
    expect(screen.getByRole('header', { name: 'Iniciar sesión' })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getAllByText('Este campo es obligatorio.')).toHaveLength(2);
  });

  it('entra al panel y navega a las órdenes', () => {
    render(<App />);
    ingresar();
    expect(screen.getByRole('header', { name: 'Panel' })).toBeTruthy();
    fireEvent.press(screen.getByRole('tab', { name: 'Órdenes de servicio' }));
    expect(
      screen.getByRole('header', { name: 'Órdenes de servicio' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /OS-0001/ })).toBeTruthy();
  });

  it('alterna entre lista y tablero', () => {
    render(<App />);
    ingresar();
    fireEvent.press(screen.getByRole('tab', { name: 'Órdenes de servicio' }));
    fireEvent.press(screen.getByRole('tab', { name: 'Tablero' }));
    expect(screen.getByRole('header', { name: 'En curso' })).toBeTruthy();
  });

  it('abre el detalle de una orden y vuelve', () => {
    render(<App />);
    ingresar();
    fireEvent.press(screen.getByRole('tab', { name: 'Órdenes de servicio' }));
    fireEvent.press(screen.getByRole('button', { name: /OS-0001/ }));
    expect(screen.getByRole('header', { name: 'OS-0001' })).toBeTruthy();
    expect(screen.getByText('Historial')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));
    expect(
      screen.getByRole('header', { name: 'Órdenes de servicio' }),
    ).toBeTruthy();
  });

  it('el formulario de nueva orden valida y crea', () => {
    render(<App />);
    ingresar();
    fireEvent.press(screen.getByRole('tab', { name: 'Nueva orden' }));
    fireEvent.press(screen.getByRole('button', { name: 'Crear orden' }));
    expect(
      screen.getAllByText('Este campo es obligatorio.').length,
    ).toBeGreaterThanOrEqual(3);
    fireEvent.changeText(screen.getByLabelText('Abonado'), 'Abonado 0001');
    fireEvent.changeText(
      screen.getByLabelText('Descripción de la falla'),
      'Fuga',
    );
    fireEvent.press(screen.getByRole('radio', { name: 'Fuga de agua' }));
    fireEvent.press(screen.getByRole('button', { name: 'Crear orden' }));
    expect(
      screen.getByRole('header', { name: 'Órdenes de servicio' }),
    ).toBeTruthy();
  });

  it('muestra el banner sin conexión al activar el modo sin señal', () => {
    render(<App />);
    ingresar();
    fireEvent.press(screen.getByRole('switch', { name: 'Sin conexión' }));
    expect(screen.getByText(/cambios por sincronizar/)).toBeTruthy();
  });
});
