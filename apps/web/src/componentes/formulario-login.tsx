'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso, Boton, Campo, LogoEmpresa, LogoOrbyta } from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';

const EMPRESA = 'Agua Potable Ejemplo';

/** Inicio de sesión. Maqueta: la autenticación real (Keycloak) llega en el paso 0.6. */
export function FormularioLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [intentado, setIntentado] = useState(false);

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    setIntentado(true);
    if (usuario && contrasena) router.push('/');
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-espacio-4">
      <form
        onSubmit={alEnviar}
        noValidate
        className="flex w-full flex-col gap-espacio-4 rounded-lg bg-superficie p-espacio-5 shadow-md"
      >
        <div className="flex flex-col items-center gap-espacio-2">
          <LogoEmpresa nombre={EMPRESA} />
          <h1 className="text-xl font-semibold">{es.login.titulo}</h1>
        </div>
        {intentado && (!usuario || !contrasena) ? (
          <Aviso tipo="error">{es.login.errorCredenciales}</Aviso>
        ) : null}
        <Campo
          etiqueta={es.login.usuario}
          ayuda={es.login.ayudaUsuario}
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          error={
            intentado && !usuario ? es.formulario.errorRequerido : undefined
          }
          required
        />
        <Campo
          etiqueta={es.login.contrasena}
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          error={
            intentado && !contrasena ? es.formulario.errorRequerido : undefined
          }
          required
        />
        <Boton type="submit" tamano="lg">
          {es.login.ingresar}
        </Boton>
      </form>
      {/* Marca de Orbyta: fija para todas las empresas. */}
      <LogoOrbyta />
    </div>
  );
}
