import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/lib/session";
import { RealtimeProvider } from "@/lib/realtime";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MockPanel } from "@/components/MockPanel";

function NotFoundComponent() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <h1 className="text-xl font-semibold">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">Algo deu errado. Tente novamente.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kurio — Marketplace de NFTs" },
      {
        name: "description",
        content: "Colecione arte digital rara de criadores emergentes e consagrados.",
      },
      { name: "theme-color", content: "#140d0a" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== "false";

/** The API lives in MSW (browser), so the app renders once the worker is active. */
function MocksGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!MOCKS);
  useEffect(() => {
    if (!MOCKS) return;
    import("@/mocks/browser").then((m) => m.startMocks()).then(() => setReady(true));
  }, []);
  if (!ready)
    return (
      <div className="container-page py-10" aria-busy="true" aria-label="Carregando">
        <div className="shimmer h-80 rounded-lg" />
      </div>
    );
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <MocksGate>
        <SessionProvider>
          <RealtimeProvider>
            <Header />
            <main id="conteudo">
              <Outlet />
            </main>
            <Footer />
            {MOCKS && <MockPanel />}
            <Toaster position="top-center" richColors closeButton />
          </RealtimeProvider>
        </SessionProvider>
      </MocksGate>
    </QueryClientProvider>
  );
}
