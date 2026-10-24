// Estrutura visual compartilhada pelas telas de entrada e cadastro.
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Centraliza formulários de conta e aplica o backdrop escuro das telas modais. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open onOpenChange={(open) => !open && navigate({ to: "/" })}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card p-6 sm:p-8 max-md:inset-0 max-md:left-0 max-md:top-0 max-md:h-dvh max-md:max-h-none max-md:w-full max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none">
        <p className="text-center text-lg font-bold tracking-[0.3em]">KURIO</p>
        <DialogTitle className="mt-6 block text-lg font-bold">{title}</DialogTitle>
        <DialogDescription className="mb-6 mt-1 text-xs text-muted-foreground">
          {subtitle}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
