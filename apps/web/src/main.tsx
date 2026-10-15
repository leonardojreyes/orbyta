import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

const raiz = createRootRoute({ component: () => <Outlet /> });
const inicio = createRoute({
  getParentRoute: () => raiz,
  path: '/',
  component: () => <h1>orbyta</h1>,
});
const router = createRouter({ routeTree: raiz.addChildren([inicio]) });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
