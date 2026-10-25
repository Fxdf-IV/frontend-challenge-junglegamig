// Estrutura visual compartilhada pelas telas de entrada e cadastro.
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Centraliza formulários de conta e aplica o backdrop escuro das telas modais. */
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
      {/* No desktop o modal segue a largura de 420px com barra inferior laranja; no mobile vira o card arredondado de 278x600. */}
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto border-[#38251a] bg-[#21150e] px-6 pt-10 pb-12 sm:max-w-[420px] sm:rounded-none sm:px-[70px] md:border-b-[10px] md:border-b-primary [&>button]:text-primary [&>button]:opacity-90 [&>button:hover]:opacity-100 max-md:inset-auto max-md:left-1/2 max-md:top-1/2 max-md:h-[600px] max-md:max-h-[calc(100dvh-2rem)] max-md:w-[min(278px,calc(100vw-2rem))] max-md:translate-x-[-50%] max-md:translate-y-[-50%] max-md:gap-2 max-md:rounded-[28px] max-md:px-5 max-md:pb-6 max-md:pt-16">
        <p className="text-center text-xl font-bold tracking-[0.2em] md:hidden">KURIO</p>
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
        <DialogTitle className="mt-6 block text-center text-lg font-bold md:sr-only max-md:mt-10 max-md:text-sm">
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
