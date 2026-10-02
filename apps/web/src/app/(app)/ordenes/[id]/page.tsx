import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { es } from '@orbyta/ui/textos';
import { ordenesEjemplo } from '@orbyta/ui/ejemplos';
import { DetalleOrden } from '../../../../componentes/detalle-orden';

export const metadata: Metadata = { title: es.detalle.titulo };

export function generateStaticParams() {
  return ordenesEjemplo.map((o) => ({ id: o.id }));
}

export default async function PaginaDetalleOrden({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orden = ordenesEjemplo.find((o) => o.id === id);
  if (!orden) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-espacio-4 text-2xl font-semibold">
        {orden.numero} · {es.detalle.titulo}
      </h1>
      <DetalleOrden orden={orden} />
    </div>
  );
}
