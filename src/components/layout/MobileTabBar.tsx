// Barra de navegação inferior mobile: reproduz o recorte curvo e botão central do Figma.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { House, Heart, ShoppingCart, User, ScanLine } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Renderiza a navegação inferior mobile estilizada com entalhe central curvo,
 * atalhos principais com foco acessível e o botão flutuante de busca/exploração.
 */
export function MobileTabBar() {
  const { user } = useSession();
  const cart = useCart();
  const count = cart.data?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Rotas com fluxo dedicado ou barra de compra fixa dispensam a barra inferior.
  const inFlow =
    pathname === "/carrinho" ||
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
    const input = document.getElementById("home-search") || document.getElementById("global-search");
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
      className="fixed inset-x-0 -bottom-px z-40 grid h-22 grid-cols-[1fr_1fr_9.5rem_1fr_1fr] rounded-t-[2.5rem] bg-card border-t border-border/40 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] md:hidden"
    >
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

      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 152 58"
          className="absolute top-0 left-1/2 h-[3.625rem] w-[9.5rem] -translate-x-1/2 fill-background"
        >
          <path d="M5.38 0H146.62A14 14 0 0 0 132.89 11.28A58 58 0 0 1 19.11 11.28A14 14 0 0 0 5.38 0Z" />
        </svg>
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
    </nav>
  );
}
