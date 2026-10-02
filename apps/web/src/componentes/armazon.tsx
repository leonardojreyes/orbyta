'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardList,
  FolderKanban,
  Home,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import {
  BarraLateral,
  Boton,
  LogoEmpresa,
  PaletaComandos,
  anilloFoco,
  cn,
  useAtajoPaleta,
  type ComandoPaleta,
  type ItemNavegacion,
} from '@orbyta/ui';
import { es } from '@orbyta/ui/textos';
import { ConmutadorTema } from './conmutador-tema';

/** Nombre de la empresa de ejemplo; en el paso 0.6 sale de la configuración por empresa. */
const EMPRESA = 'Agua Potable Ejemplo';

/** Estructura de la aplicación: barra lateral, barra superior con búsqueda y paleta de comandos. */
export function Armazon({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const [colapsada, setColapsada] = useState(false);
  const [paleta, setPaleta] = useState(false);
  useAtajoPaleta(() => setPaleta(true));

  const items: ItemNavegacion[] = [
    {
      id: 'inicio',
      etiqueta: es.navegacion.inicio,
      icono: Home,
      href: '/',
      activo: ruta === '/',
    },
    {
      id: 'ordenes',
      etiqueta: es.navegacion.ordenes,
      icono: ClipboardList,
      href: '/ordenes',
      activo: ruta.startsWith('/ordenes'),
      contador: 5,
    },
    {
      id: 'proyectos',
      etiqueta: es.navegacion.proyectos,
      icono: FolderKanban,
      hijos: [
        { id: 'red-norte', etiqueta: 'Red norte', href: '/ordenes' },
        { id: 'red-sur', etiqueta: 'Red sur', href: '/ordenes' },
      ],
    },
    {
      id: 'abonados',
      etiqueta: es.navegacion.abonados,
      icono: Users,
      href: '/',
    },
  ];

  const comandos: ComandoPaleta[] = [
    {
      id: 'nueva',
      grupo: 'Acciones',
      etiqueta: es.navegacion.nuevaOrden,
      ejecutar: () => router.push('/ordenes/nueva'),
    },
    {
      id: 'inicio',
      grupo: 'Navegación',
      etiqueta: es.navegacion.inicio,
      ejecutar: () => router.push('/'),
    },
    {
      id: 'ordenes',
      grupo: 'Navegación',
      etiqueta: es.navegacion.ordenes,
      ejecutar: () => router.push('/ordenes'),
    },
  ];

  return (
    <div className="flex h-screen">
      <BarraLateral
        logo={<LogoEmpresa nombre={EMPRESA} />}
        items={items}
        colapsada={colapsada}
        onAlternar={() => setColapsada((c) => !c)}
        onNavegar={(item) => item.href && router.push(item.href)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-espacio-3 border-b border-borde-suave bg-superficie px-espacio-4 py-espacio-2">
          <button
            type="button"
            onClick={() => setPaleta(true)}
            className={cn(
              'flex min-h-fila-web flex-1 items-center gap-espacio-2 rounded-md border border-borde-campo bg-fondo px-espacio-3 text-left text-md text-texto-secundario sm:max-w-md',
              anilloFoco,
            )}
          >
            <Search aria-hidden className="h-4 w-4" />
            <span className="flex-1">{es.navegacion.paletaAtajo}</span>
            <kbd className="text-xs">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-espacio-2">
            <Boton onClick={() => router.push('/ordenes/nueva')}>
              <Plus aria-hidden className="h-4 w-4" />
              {es.navegacion.nuevaOrden}
            </Boton>
            <ConmutadorTema />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-espacio-5">{children}</main>
      </div>
      <PaletaComandos
        abierta={paleta}
        onCambio={setPaleta}
        comandos={comandos}
      />
    </div>
  );
}
