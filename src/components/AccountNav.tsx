// Navegação da área autenticada do usuário (Meu perfil) com menu retrátil no mobile e barra lateral no desktop.
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Itens de navegação principal da conta com rota ativa. */
const PRIMARY_LINKS = [
  { to: "/perfil", label: "Dados do perfil", icon: User },
  { to: "/carteiras", label: "Carteiras", icon: MapPin },
  { to: "/favoritos", label: "Lista de interesse", icon: Heart },
] as const;

/** Itens fora do escopo funcional que exibem aviso de indisponibilidade ao usuário. */
const SOON_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Atividade", icon: ShoppingCart },
  { label: "Ofertas", icon: TrendingUp },
  { label: "Arquivos baixados", icon: Download },
  { label: "Suporte", icon: AlertTriangle },
];

/**
 * Menu de navegação da conta do colecionador:
 * - Mobile: Botão seletor no padrão dark/ouro que abre uma gaveta inferior (Sheet) acessível com todas as opções.
 * - Desktop: Barra lateral contínua alinhada visualmente aos frames do Figma com indicador vertical no item ativo.
 */
export function AccountNav() {
  const { signOut } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /** Identifica o item atualmente ativo na rota. */
  const activePrimary = PRIMARY_LINKS.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  const currentLabel = activePrimary ? activePrimary.label : "Meu perfil";
  const CurrentIcon = activePrimary ? activePrimary.icon : User;

  /** Exibe aviso acessível para funcionalidades que não fazem parte do escopo avaliado. */
  const notifyUnavailable = (feature: string) => {
    toast.info(`${feature}: funcionalidade indisponível no momento`);
  };

  const desktopNavItemClass =
    "flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-xs md:text-sm font-mono transition-colors text-left";

  return (
    <>
      {/* Seletor mobile da conta: card acessível que aciona a gaveta de opções (elimina scroll lateral) */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={`Seção atual: ${currentLabel}. Toque para abrir opções de navegação da conta`}
              className="group flex w-full items-center justify-between rounded-xl border border-[#3d2c20] bg-card/90 p-3 shadow-sm backdrop-blur-md transition-all active:scale-[0.99] hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20 transition-colors group-hover:bg-primary/20">
                  <CurrentIcon className="size-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Seção da conta
                  </span>
                  <span className="block text-sm font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                    {currentLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg border border-[#3d2c20] bg-background/60 px-3 py-1.5 text-xs font-mono font-medium text-[#CFB28C] group-hover:text-primary group-hover:border-primary/40 transition-colors">
                <span>Opções</span>
                <ChevronsUpDown className="size-3.5 opacity-80" aria-hidden="true" />
              </div>
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="max-h-[85vh] rounded-t-2xl border-t border-[#3d2c20] bg-[#140d07] p-0 pb-6 text-foreground shadow-2xl"
          >
            {/* Puxador visual estilo gaveta móvel nativa */}
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#3d2c20]" aria-hidden="true" />

            <SheetHeader className="px-5 pt-3 pb-3 text-left border-b border-[#3d2c20]/60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <User className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <SheetTitle className="text-sm font-bold font-mono text-foreground tracking-wide">
                    Navegação da conta
                  </SheetTitle>
                  <SheetDescription className="text-xs font-mono text-muted-foreground">
                    Selecione uma seção para navegar
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <nav
              aria-label="Navegação da conta móvel"
              className="p-3 space-y-1 overflow-y-auto max-h-[calc(85vh-6rem)]"
            >
              {/* Seção 1: Páginas ativas */}
              <div className="px-2 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Páginas da conta
              </div>

              {PRIMARY_LINKS.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSheetOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-[#1f150e]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-primary font-semibold">
                        <Check className="size-3.5" aria-hidden="true" />
                        <span>Atual</span>
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Seção 2: Recursos adicionais */}
              <div className="px-2 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Recursos adicionais
              </div>

              {SOON_ITEMS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setSheetOpen(false);
                    notifyUnavailable(label);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono text-muted-foreground/80 hover:text-foreground hover:bg-[#1f150e] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="rounded-full border border-border/40 bg-background/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    Em breve
                  </span>
                </button>
              ))}

              {/* Seção 3: Logout */}
              <div className="pt-2 mt-2 border-t border-[#3d2c20]/60">
                <button
                  type="button"
                  onClick={() => {
                    setSheetOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="size-4 shrink-0 text-red-400" aria-hidden="true" />
                    <span className="text-sm">Sair da conta</span>
                  </div>
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
                desktopNavItemClass,
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
