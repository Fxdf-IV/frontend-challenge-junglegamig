// Estrutura visual compartilhada pelas telas de entrada e cadastro.
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card px-6 py-8 sm:max-w-[360px] sm:px-10 max-md:inset-auto max-md:left-1/2 max-md:top-1/2 max-md:h-[600px] max-md:max-h-[calc(100dvh-2rem)] max-md:w-[min(278px,calc(100vw-2rem))] max-md:translate-x-[-50%] max-md:translate-y-[-50%] max-md:gap-2 max-md:rounded-[28px] max-md:px-5 max-md:pb-6 max-md:pt-20">
        <p className="text-center text-lg font-bold tracking-[0.3em]">KURIO</p>
        <nav aria-label="Autenticação" className="hidden grid-cols-2 text-center md:grid">
          <Link
            to="/login"
            search={{ redirect }}
            aria-current={activeMode === "login" ? "page" : undefined}
            className={`border-b py-2 text-sm font-semibold ${activeMode === "login" ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            search={{ redirect }}
            aria-current={activeMode === "register" ? "page" : undefined}
            className={`border-b py-2 text-sm font-semibold ${activeMode === "register" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            Criar conta
          </Link>
        </nav>
        <DialogTitle className="mt-6 block text-center text-lg font-bold md:sr-only max-md:mt-12 max-md:text-sm">
          {title}
        </DialogTitle>
        <DialogDescription className="mb-6 mt-1 hidden text-center text-xs text-muted-foreground md:block">
          {subtitle}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
