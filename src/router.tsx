// Configuração do roteador TanStack Router com TanStack Query integrado e política de retries.
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { ApiError } from "./api/client";

/** Cria e retorna a instância do roteador com cache, restauração de rolagem e query client. */
export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        // retry transient failures only; never 4xx
        retry: (count, e) => {
          const s = (e as ApiError).status ?? 0;
          return (s === 0 || s >= 500) && count < 2;
        },
        retryDelay: (n) => Math.min(400 * 2 ** n, 2000),
      },
      mutations: { retry: false },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
