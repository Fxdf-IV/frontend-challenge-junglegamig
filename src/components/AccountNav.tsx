// Navegação lateral da área autenticada do usuário (Meu perfil) alinhada aos frames do Figma.
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Itens fora do escopo funcional que exibem aviso de indisponibilidade ao usuário. */
const SOON_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Atividade", icon: ShoppingCart },
  { label: "Ofertas", icon: TrendingUp },
  { label: "Arquivos baixados", icon: Download },
  { label: "Suporte", icon: AlertTriangle },
];

/**
 * Menu lateral com as opções do perfil do colecionador e atalho para logout.
 * Alinhado visualmente aos frames do Figma com indicador vertical laranja no item ativo.
 */
export function AccountNav() {
  const { signOut } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /** Exibe aviso acessível para funcionalidades que não fazem parte do escopo avaliado. */
  const notifyUnavailable = (feature: string) => {
    toast.info(`${feature}: funcionalidade indisponível no momento`);
  };

  const navItemClass =
    "flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-xs md:text-sm font-mono transition-colors text-left";

  return (
    <>
      {/* Navegação horizontal móvel para telas menores que md (390px / mobile) */}
      <nav
        aria-label="Minha conta"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden"
      >
        <Link
          to="/perfil"
          aria-current={pathname === "/perfil" ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-mono whitespace-nowrap transition-colors",
            pathname === "/perfil"
              ? "border-primary bg-primary/10 font-bold text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Dados do perfil
        </Link>
        <Link
          to="/carteiras"
          aria-current={pathname === "/carteiras" ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-mono whitespace-nowrap transition-colors",
            pathname === "/carteiras"
              ? "border-primary bg-primary/10 font-bold text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Carteiras
        </Link>
        <Link
          to="/favoritos"
          aria-current={pathname === "/favoritos" ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-mono whitespace-nowrap transition-colors",
            pathname === "/favoritos"
              ? "border-primary bg-primary/10 font-bold text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Lista de interesse
        </Link>
        {SOON_ITEMS.map(({ label }) => (
          <button
            key={label}
            type="button"
            onClick={() => notifyUnavailable(label)}
            className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs font-mono whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => signOut()}
          className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs font-mono font-bold whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
        >
          Sair
        </button>
      </nav>

      {/* Barra lateral desktop com visual do Figma */}
      <nav
        aria-label="Meu perfil"
        className="hidden md:block h-fit rounded-lg bg-card py-4 border border-border/40 shadow-sm"
      >
        <h2 className="px-4 pb-3 text-base font-bold font-mono text-foreground">Meu perfil</h2>
        <ul className="space-y-0.5">
          <li>
            <Link
              to="/perfil"
              aria-current={pathname === "/perfil" ? "page" : undefined}
              className={cn(
                navItemClass,
                pathname === "/perfil"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Dados do perfil</span>
            </Link>
          </li>
          <li>
            <Link
              to="/carteiras"
              aria-current={pathname === "/carteiras" ? "page" : undefined}
              className={cn(
                navItemClass,
                pathname === "/carteiras"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Carteiras</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => notifyUnavailable("Atividade")}
              className={cn(
                navItemClass,
                "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Atividade</span>
            </button>
          </li>
          <li>
            <Link
              to="/favoritos"
              aria-current={pathname === "/favoritos" ? "page" : undefined}
              className={cn(
                navItemClass,
                pathname === "/favoritos"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Lista de interesse</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => notifyUnavailable("Ofertas")}
              className={cn(
                navItemClass,
                "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Ofertas</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => notifyUnavailable("Arquivos baixados")}
              className={cn(
                navItemClass,
                "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Arquivos baixados</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => notifyUnavailable("Suporte")}
              className={cn(
                navItemClass,
                "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/40",
              )}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Suporte</span>
            </button>
          </li>
          <li className="pt-2">
            <button
              type="button"
              onClick={() => signOut()}
              className={cn(
                navItemClass,
                "border-transparent text-muted-foreground hover:text-primary hover:bg-panel/40 font-semibold",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
