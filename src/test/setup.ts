// Configuração do ambiente global de testes Vitest com polyfills para DOM, matchMedia e observadores.
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class MockIntersectionObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

// Polyfill global de IntersectionObserver para ambiente JSDOM/Vitest.
(
  globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }
).IntersectionObserver = MockIntersectionObserver;
if (typeof window !== "undefined") {
  (
    window as unknown as { IntersectionObserver: typeof MockIntersectionObserver }
  ).IntersectionObserver = MockIntersectionObserver;
}
if (typeof global !== "undefined") {
  (
    global as unknown as { IntersectionObserver: typeof MockIntersectionObserver }
  ).IntersectionObserver = MockIntersectionObserver;
}

class MockResizeObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});
