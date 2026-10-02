import type { ReactNode } from 'react';
import { Armazon } from '../../componentes/armazon';

export default function LayoutAplicacion({
  children,
}: {
  children: ReactNode;
}) {
  return <Armazon>{children}</Armazon>;
}
