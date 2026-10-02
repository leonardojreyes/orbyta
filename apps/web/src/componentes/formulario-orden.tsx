'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Boton, Campo, CampoFecha, Selector } from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';

const tipos = es.formulario.tiposFalla.map((t) => ({ valor: t, etiqueta: t }));

/** Formulario de nueva OS. Maqueta: la creación real llega en el paso 0.6. */
export function FormularioOrden() {
  const router = useRouter();
  const [abonado, setAbonado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoFalla, setTipoFalla] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [fecha, setFecha] = useState('');
  const [intentado, setIntentado] = useState(false);

  const requerido = (valor: string) =>
    intentado && !valor ? es.formulario.errorRequerido : undefined;

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    setIntentado(true);
    if (abonado && descripcion && tipoFalla) router.push('/ordenes');
  };

  return (
    <form
      onSubmit={alEnviar}
      noValidate
      className="flex max-w-xl flex-col gap-espacio-4"
    >
      <h1 className="text-2xl font-semibold">{es.formulario.titulo}</h1>
      <Campo
        etiqueta={es.formulario.abonado}
        value={abonado}
        onChange={(e) => setAbonado(e.target.value)}
        error={requerido(abonado)}
        required
      />
      <Campo
        etiqueta={es.formulario.descripcion}
        ayuda={es.formulario.ayudaDescripcion}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        error={requerido(descripcion)}
        required
      />
      <Selector
        etiqueta={es.formulario.tipoFalla}
        opciones={tipos}
        valor={tipoFalla}
        onCambio={setTipoFalla}
        error={requerido(tipoFalla)}
      />
      <Campo
        etiqueta={es.formulario.ubicacion}
        ayuda={es.formulario.ayudaUbicacion}
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
        opcional
      />
      <CampoFecha
        etiqueta={es.formulario.fechaProgramada}
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        opcional
      />
      <div className="flex gap-espacio-2">
        <Boton type="submit">{es.formulario.crear}</Boton>
        <Boton variante="secundario" onClick={() => router.push('/ordenes')}>
          {es.comunes.cancelar}
        </Boton>
      </div>
    </form>
  );
}
