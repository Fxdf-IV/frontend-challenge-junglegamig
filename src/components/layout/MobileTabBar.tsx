// Barra de navegação inferior mobile: reproduz o recorte curvo vazado (transparente) e botão central do Figma.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { House, Heart, ShoppingCart, User, ScanLine } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Renderiza a navegação inferior mobile estilizada com entalhe central curvo e vazado,
 * permitindo total transparência no recorte do botão central flutuante e atalhos com foco acessível.
 */
export function MobileTabBar() {
  const { user } = useSession();
  const cart = useCart();
  const count = cart.data?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Rotas de fluxo linear imersivo ou autenticação em tela cheia dispensam a barra inferior.
  const inFlow =
    pathname === "/checkout" ||
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname.startsWith("/nft/") ||
    pathname.startsWith("/pedido/");

  if (inFlow) return null;

  /** Ativa a busca móvel ou direciona o foco para o catálogo na home. */
  const explore = async () => {
    if (pathname !== "/") {
      await navigate({ to: "/" });
    }
    const input =
      document.getElementById("home-search") || document.getElementById("global-search");
    if (input) {
      input.focus();
    } else {
      const catalog = document.getElementById("catalogo");
      if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 -bottom-px z-40 h-22 pointer-events-none md:hidden"
    >
      {/* Fundo com silhueta contornada e entalhe 100% vazado (transparente) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none drop-shadow-[0_-4px_20px_rgba(0,0,0,0.45)]"
      >
        {/* Asa esquerda com canto superior arredondado */}
        <div className="absolute inset-y-0 left-0 right-[calc(50%+4.75rem-1px)] rounded-tl-[2.5rem] bg-card border-t border-border/40" />

        {/* Peça central com entalhe curvo: o vão do botão é transparente sem preenchimento opaco */}
        <div className="absolute inset-y-0 left-1/2 w-[9.5rem] -translate-x-1/2">
          <svg
            viewBox="0 0 152 88"
            className="block h-full w-full overflow-visible"
            aria-hidden="true"
          >
            {/* Preenchimento da barra contornando o arco côncavo */}
            <path
              d="M 0 0 L 5.38 0 A 14 14 0 0 1 19.11 11.28 A 58 58 0 0 0 132.89 11.28 A 14 14 0 0 1 146.62 0 L 152 0 L 152 88 L 0 88 Z"
              className="fill-card"
              style={{ fill: "var(--card)" }}
            />
            {/* Borda superior que acompanha os arcos convexos e o arco central */}
            <path
              d="M 0 0 L 5.38 0 A 14 14 0 0 1 19.11 11.28 A 58 58 0 0 0 132.89 11.28 A 14 14 0 0 1 146.62 0 L 152 0"
              fill="none"
              className="stroke-border/40 stroke-1"
              style={{ stroke: "color-mix(in oklab, var(--border) 40%, transparent)" }}
            />
          </svg>
        </div>

        {/* Asa direita com canto superior arredondado */}
        <div className="absolute inset-y-0 right-0 left-[calc(50%+4.75rem-1px)] rounded-tr-[2.5rem] bg-card border-t border-border/40" />
      </div>

      {/* Grade de botões e links navegáveis com suporte a teclado e toque */}
      <div className="relative z-10 grid h-full grid-cols-[1fr_1fr_9.5rem_1fr_1fr] items-center pointer-events-auto">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors outline-none focus-visible:text-primary",
            pathname === "/" && "text-primary font-bold",
          )}
          aria-label="Início"
        >
          <House className="size-6" />
          <span className="sr-only">Início</span>
        </Link>

        <Link
          to={user ? "/favoritos" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors outline-none focus-visible:text-primary",
            pathname === "/favoritos" && "text-primary font-bold",
          )}
          aria-label="Favoritos"
        >
          <Heart className={cn("size-6", pathname === "/favoritos" && "fill-current")} />
          <span className="sr-only">Favoritos</span>
        </Link>

        <div className="relative h-full">
          <button
            type="button"
            aria-label="Explorar coleções"
            onClick={explore}
            className="absolute top-0 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-3 focus-visible:ring-primary shadow-[0_0_24px_rgba(210,138,76,0.35)] cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-linear-to-br from-primary to-[color-mix(in_oklab,var(--primary),black_30%)] opacity-90 transition-opacity hover:opacity-100"
            />
            <ScanLine className="relative size-7 text-primary-foreground" />
          </button>
        </div>

        <Link
          to="/carrinho"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors outline-none focus-visible:text-primary",
            pathname === "/carrinho" && "text-primary font-bold",
          )}
          aria-label={count ? `Carrinho, ${count} itens` : "Carrinho"}
        >
          <span className="relative">
            <ShoppingCart className="size-6" />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </span>
          <span className="sr-only">Carrinho</span>
        </Link>

        <Link
          to={user ? "/perfil" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors outline-none focus-visible:text-primary",
            (pathname === "/perfil" || pathname === "/login") && "text-primary font-bold",
          )}
          aria-label={user ? "Perfil" : "Entrar"}
        >
          <User className="size-6" />
          <span className="sr-only">{user ? "Perfil" : "Entrar"}</span>
        </Link>
      </div>
    </nav>
  );
}
