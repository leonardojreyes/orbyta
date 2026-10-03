import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

class ResizeObserverSimulado {
  observe = () => undefined;
  unobserve = () => undefined;
  disconnect = () => undefined;
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver =
  ResizeObserverSimulado;
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.releasePointerCapture = () => undefined;
window.matchMedia =
  window.matchMedia ??
  ((consulta: string) =>
    ({
      matches: false,
      media: consulta,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }) as unknown as MediaQueryList);
