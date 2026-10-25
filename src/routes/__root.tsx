// Casca da aplicação: configura providers, navegação compartilhada e estados globais.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
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
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";
import { cn } from "@/lib/utils";

/** Apresenta uma saída simples quando a URL não corresponde a uma rota. */
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

/** Recupera erros de rota sem encerrar a sessão atual. */
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

/** Rota raiz e metadados compartilhados da aplicação. */
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
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/** Monta o documento HTML e o ponto de conteúdo acessível. */
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
// O painel de cenários só aparece quando solicitado para não cobrir o design.
const SHOW_MOCK_PANEL = import.meta.env.VITE_SHOW_MOCK_PANEL === "true";

/** Aguarda o worker de mocks antes de exibir telas que dependem da API. */
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

/** Fornece cache, sessão, tempo real e layout global às rotas. */
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hideFooterOnMobile =
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname === "/carrinho" ||
    pathname === "/checkout" ||
    pathname.startsWith("/nft/") ||
    pathname.startsWith("/pedido/");
  const isAuthRoute = pathname === "/login" || pathname === "/cadastro";
  return (
    <QueryClientProvider client={queryClient}>
      <MocksGate>
        <SessionProvider>
          <RealtimeProvider>
            <Header />
            <main id="conteudo">
              {isAuthRoute && <AuthBackdrop />}
              <Outlet />
            </main>
            <div className={cn(hideFooterOnMobile && "max-md:hidden")}>
              <Footer />
            </div>
            {MOCKS && SHOW_MOCK_PANEL && <MockPanel />}
            <Toaster position="top-center" richColors closeButton />
          </RealtimeProvider>
        </SessionProvider>
      </MocksGate>
    </QueryClientProvider>
  );
}
