import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart, User as UserIcon, Wallet, LogOut, Home, Store, Heart } from "lucide-react";
import { useState, type FormEvent } from "react";
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

const NAV = [
  { to: "/", label: "Início", exact: true },
  { to: "/mercado", label: "Mercado" },
  { to: "/criadores", label: "Criadores" },
  { to: "/aprenda", label: "Aprenda" },
] as const;

export function Header() {
  const { user, signOut } = useSession();
  const cart = useCart();
  const count = cart.data?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;
  const href = useRouterState({ select: (s) => s.location.href });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate({ to: "/mercado", search: { q: q.trim() || undefined } });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link to="/" className="text-sm font-bold tracking-[0.2em]" aria-label="Kurio — página inicial">
            KURIO
          </Link>
          <nav aria-label="Principal" className="hidden h-full items-center gap-8 md:flex">
            {NAV.map((n) => {
              const active = "exact" in n ? pathname === n.to : pathname.startsWith(n.to) || (n.to === "/mercado" && pathname.startsWith("/nft"));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center text-sm transition-colors hover:text-primary",
                    active && "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end gap-2 md:gap-3">
            <Button variant="ghost" size="icon" aria-label="Buscar NFTs" aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)}>
              <Search />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/carrinho" aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`} className="relative">
                <ShoppingCart />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="line" size="sm" aria-label={`Conta de ${user.displayName}`}>
                    {user.avatar ? <img src={user.avatar} alt="" className="h-5 w-5 rounded-full object-cover" /> : <UserIcon />}
                    <span className="hidden max-w-24 truncate sm:inline">{user.displayName.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/perfil"><UserIcon /> Meu perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/carteiras"><Wallet /> Carteiras</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut().then(() => navigate({ to: "/" }))}>
                    <LogOut /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="brand" size="sm" className="normal-case" asChild>
                <Link to="/login" search={{ redirect: href }}>
                  <LogIn /> Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>
        {searchOpen && (
          <form role="search" onSubmit={submit} className="container-page pb-3">
            <label htmlFor="global-search" className="sr-only">Buscar NFTs</label>
            <input
              id="global-search"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Buscar por nome, criador ou coleção"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground"
            />
          </form>
        )}
      </header>
      <MobileTabBar count={count} signedIn={!!user} />
    </>
  );
}

function MobileTabBar({ count, signedIn }: { count: number; signedIn: boolean }) {
  const items = [
    { to: "/", label: "Início", icon: Home },
    { to: "/mercado", label: "Mercado", icon: Store },
    { to: "/carrinho", label: `Carrinho (${count})`, icon: ShoppingCart },
    { to: signedIn ? "/perfil" : "/login", label: signedIn ? "Perfil" : "Entrar", icon: signedIn ? UserIcon : Heart },
  ] as const;
  return (
    <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to} className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: it.to === "/" }}>
              <it.icon className="h-5 w-5" aria-hidden />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
