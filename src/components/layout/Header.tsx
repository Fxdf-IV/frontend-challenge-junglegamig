// Cabeçalho e navegação: expõe caminhos principais e ações globais da conta.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart, User as UserIcon, Wallet, LogOut, X } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { MobileTabBar } from "./MobileTabBar";

/** Ícone oficial de busca mobile exportado do Figma (22x22). */
function FigmaSearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.5299 3.24375C6.50501 3.24375 3.24358 6.50259 3.24358 10.5209C3.24358 14.5391 6.50501 17.798 10.5299 17.798C12.5379 17.798 14.3549 16.9877 15.6735 15.6752C16.998 14.3567 17.8162 12.5348 17.8162 10.5209C17.8162 6.50259 14.5548 3.24375 10.5299 3.24375ZM1.83332 10.5209C1.83332 5.72219 5.72768 1.8335 10.5299 1.8335C15.3321 1.8335 19.2265 5.72219 19.2265 10.5209C19.2265 12.6708 18.444 14.6391 17.1493 16.1555L19.9598 18.9628C20.2354 19.238 20.2356 19.6845 19.9604 19.96C19.6852 20.2355 19.2387 20.2358 18.9632 19.9606L16.15 17.1506C14.6346 18.4337 12.6722 19.2082 10.5299 19.2082C5.72768 19.2082 1.83332 15.3195 1.83332 10.5209Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
}

/** Ícone oficial do carrinho de compras mobile exportado do Figma (20x20). */
function FigmaShopIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18.3333 6.80118L17.3897 12.7776C17.2181 13.9561 16.2745 14.7136 15.0735 14.7136H6.83825C5.72305 14.7136 4.69364 13.8719 4.52207 12.7776L3.49266 5.79108L3.2353 3.85506C3.14952 3.35001 2.7206 3.01331 2.12011 3.01331H1.51962C1.17648 3.01331 0.833344 2.6766 0.833344 2.3399C0.833344 2.0032 1.17648 1.6665 1.51962 1.6665H2.12011C3.32109 1.6665 4.3505 2.50825 4.43628 3.68671L4.60785 5.03351H16.7892C17.2181 5.03351 17.6471 5.20186 17.9044 5.53856C18.2476 5.87526 18.3333 6.38031 18.3333 6.80118Z"
        fill="currentColor"
      />
      <path
        d="M15.2451 18.3332C15.7189 18.3332 16.103 17.9563 16.103 17.4914C16.103 17.0265 15.7189 16.6497 15.2451 16.6497C14.7713 16.6497 14.3873 17.0265 14.3873 17.4914C14.3873 17.9563 14.7713 18.3332 15.2451 18.3332Z"
        fill="currentColor"
      />
      <path
        d="M6.66668 18.3332C7.14045 18.3332 7.52452 17.9563 7.52452 17.4914C7.52452 17.0265 7.14045 16.6497 6.66668 16.6497C6.1929 16.6497 5.80883 17.0265 5.80883 17.4914C5.80883 17.9563 6.1929 18.3332 6.66668 18.3332Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Ícone oficial de perfil mobile exportado do Figma (20x20). */
function FigmaUserIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.0001 9.82977C12.2659 9.82977 14.1026 8.00236 14.1026 5.74814C14.1026 3.49391 12.2659 1.6665 10.0001 1.6665C7.73429 1.6665 5.89751 3.49391 5.89751 5.74814C5.89751 8.00236 7.73429 9.82977 10.0001 9.82977Z"
        fill="currentColor"
      />
      <path
        d="M12.1368 11.5305H7.86332C5.38469 11.5305 3.3334 13.5713 3.3334 16.0373C3.3334 16.6326 3.58981 17.1428 4.10264 17.3979C4.87187 17.823 6.58127 18.3332 10.0001 18.3332C13.4189 18.3332 15.1283 17.823 15.8975 17.3979C16.3249 17.1428 16.6667 16.6326 16.6667 16.0373C16.6667 13.4863 14.6155 11.5305 12.1368 11.5305Z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV = [
  { to: "/", label: "Início", exact: true },
  { to: "/mercado", label: "Mercado" },
  { to: "/criadores", label: "Criadores" },
  { to: "/aprenda", label: "Aprenda" },
] as const;

/** Renderiza navegação desktop e os controles móveis previstos por tela. */
export function Header() {
  const { user, signOut } = useSession();
  const cart = useCart();
  const count = cart.data?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;
  const href = useRouterState({ select: (s) => s.location.href });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStandaloneMobile =
    pathname === "/" ||
    pathname === "/carrinho" ||
    pathname === "/checkout" ||
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname.startsWith("/nft/");
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLFormElement>(null);

  // Fecha o campo de busca inline ao clicar fora dele
  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate({ to: "/mercado", search: { q: q.trim() || undefined } });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-[#3d2c20]/60 bg-background/95 backdrop-blur-md max-md:animate-hero-header-drop",
          isStandaloneMobile && "max-md:hidden",
        )}
      >
        <div className="container-page flex h-14 items-center justify-between md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <Link
            to="/"
            className="text-base font-mono font-bold tracking-[0.25em] text-foreground hover:text-primary transition-colors md:text-sm md:tracking-[0.2em]"
            aria-label="Kurio — página inicial"
          >
            KURIO
          </Link>
          <nav aria-label="Principal" className="hidden h-full items-center gap-8 md:flex">
            {NAV.map((n) => {
              const active =
                "exact" in n
                  ? pathname === n.to
                  : pathname.startsWith(n.to) ||
                    (n.to === "/mercado" && pathname.startsWith("/nft"));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center text-sm transition-colors hover:text-primary",
                    active &&
                      "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3">
            {/* Campo de busca expansível inline: não altera a altura do cabeçalho nem causa layout shift */}
            {searchOpen ? (
              <form
                ref={searchRef}
                role="search"
                onSubmit={submit}
                className="relative flex items-center animate-in fade-in-0 zoom-in-95 duration-200"
              >
                <label htmlFor="global-search" className="sr-only">
                  Buscar no catálogo
                </label>
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="global-search"
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  placeholder="Buscar coleções ou NFTs…"
                  className="h-9 w-36 rounded-md border border-[#3d2c20] bg-[#19110a] pl-8 pr-7 font-mono text-xs text-foreground placeholder:text-muted-foreground transition-all focus-visible:border-primary focus-visible:outline-none sm:w-48 md:w-60"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Fechar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buscar NFTs"
                aria-expanded={false}
                onClick={() => setSearchOpen(true)}
                className="size-9 rounded-full text-[#CFB28C] hover:bg-primary/10 hover:text-primary md:size-10 md:rounded-md md:text-foreground transition-colors cursor-pointer"
              >
                <span className="md:hidden">
                  <FigmaSearchIcon className="size-5 fill-current" />
                </span>
                <span className="hidden md:inline-flex">
                  <Search />
                </span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="size-9 rounded-full text-[#CFB28C] hover:text-primary hover:bg-primary/10 md:size-10 md:rounded-md md:text-foreground transition-colors"
            >
              <Link
                to="/carrinho"
                aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
                className="relative flex items-center justify-center"
              >
                <span className="md:hidden">
                  <FigmaShopIcon className="size-5 fill-current" />
                </span>
                <span className="hidden md:inline-flex">
                  <ShoppingCart />
                </span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-mono font-bold text-primary-foreground shadow-sm md:-right-0.5 md:-top-0.5">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Conta de ${user.displayName}`}
                    className="size-9 rounded-full text-[#CFB28C] hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer md:h-9 md:w-auto md:gap-2 md:rounded-md md:border md:border-primary md:bg-transparent md:px-3 md:py-2 md:text-primary md:shadow-xs md:hover:bg-primary/10"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="size-7 rounded-full object-cover ring-1 ring-primary/40 md:h-5 md:w-5 md:ring-0"
                      />
                    ) : (
                      <>
                        <span className="md:hidden">
                          <FigmaUserIcon className="size-5 fill-current" />
                        </span>
                        <span className="hidden md:inline-flex">
                          <UserIcon />
                        </span>
                      </>
                    )}
                    <span className="hidden max-w-24 truncate sm:inline md:text-xs md:font-semibold">
                      {user.displayName.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">
                      <UserIcon /> Meu perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carteiras">
                      <Wallet /> Carteiras
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut().then(() => navigate({ to: "/" }))}>
                    <LogOut /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-[#CFB28C] hover:text-primary hover:bg-primary/10 md:hidden transition-colors"
                  asChild
                >
                  <Link to="/login" search={{ redirect: href }} aria-label="Entrar na conta">
                    <FigmaUserIcon className="size-5 fill-current" />
                  </Link>
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  className="hidden md:inline-flex normal-case"
                  asChild
                >
                  <Link to="/login" search={{ redirect: href }}>
                    <LogIn /> Entrar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <MobileTabBar />
    </>
  );
}
