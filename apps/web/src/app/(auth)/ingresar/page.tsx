import type { Metadata } from 'next';
import { es } from '@orbyta/ui/textos';
import { FormularioLogin } from '../../../componentes/formulario-login';

export const metadata: Metadata = { title: es.login.titulo };

export default function PaginaIngresar() {
  return (
    <main className="flex min-h-screen items-center justify-center p-espacio-4">
      <FormularioLogin />
    </main>
  );
}
