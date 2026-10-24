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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card px-6 py-8 sm:max-w-[360px] sm:px-10 max-md:inset-0 max-md:left-0 max-md:top-0 max-md:h-dvh max-md:max-h-none max-md:w-full max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none">
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
        <DialogTitle className="mt-6 block text-center text-lg font-bold md:sr-only">
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
