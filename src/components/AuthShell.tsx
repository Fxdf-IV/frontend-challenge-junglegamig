// Estrutura visual compartilhada pelas telas de entrada e cadastro alinhada aos frames do Figma.
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Centraliza formulários de conta com modal no desktop e tela cheia imersiva no mobile conforme o Figma. */
export function AuthShell({
  title,
  subtitle,
  activeMode,
  redirect,
  children,
}: {
  title: string;
  subtitle: string;
  activeMode: "login" | "register";
  redirect?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open onOpenChange={(open) => !open && navigate({ to: "/" })}>
      {/* No desktop: modal de 420px com abas superiores e barra laranja; no mobile: tela cheia imersiva conforme frames do Figma */}
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto border-[#38251a] bg-[#21150e] px-6 pt-10 pb-12 sm:max-w-[420px] sm:rounded-none sm:px-[70px] md:border-b-[10px] md:border-b-primary [&>button]:text-primary [&>button]:opacity-90 [&>button:hover]:opacity-100 max-md:fixed max-md:inset-0 max-md:left-0 max-md:top-0 max-md:z-50 max-md:h-full max-md:max-h-none max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none max-md:border-0 max-md:bg-[#0c0805] max-md:px-7 max-md:pt-14 max-md:pb-8 max-md:[&>button]:hidden">
        {/* Logotipo KURIO centralizado no topo do mobile conforme frames do Figma */}
        <p className="text-center text-2xl font-bold font-mono tracking-[0.25em] text-foreground md:hidden mb-8">
          KURIO
        </p>

        {/* Navegação desktop inline ("Entrar | Criar conta") com divisor vertical conforme o Figma. */}
        <nav
          aria-label="Autenticação"
          className="hidden items-center justify-center gap-3 text-center md:flex"
        >
          <Link
            to="/login"
            search={{ redirect }}
            aria-current={activeMode === "login" ? "page" : undefined}
            className={`text-xl font-medium tracking-wide transition-colors ${activeMode === "login" ? "text-primary" : "text-foreground hover:text-primary/80"}`}
          >
            Entrar
          </Link>
          <span aria-hidden="true" className="h-5 w-px bg-primary/50" />
          <Link
            to="/cadastro"
            search={{ redirect }}
            aria-current={activeMode === "register" ? "page" : undefined}
            className={`text-xl font-medium tracking-wide transition-colors ${activeMode === "register" ? "text-primary" : "text-foreground hover:text-primary/80"}`}
          >
            Criar conta
          </Link>
        </nav>

        {/* Título da tela: no mobile exibido como cabeçalho da página ("Entrar" / "Criar perfil de colecionador") */}
        <DialogTitle className="block text-center text-base font-bold font-mono text-foreground mb-6 md:sr-only">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-2 mb-4 hidden text-center text-xs leading-relaxed text-foreground/90 md:-mx-6 md:block">
          {subtitle}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
