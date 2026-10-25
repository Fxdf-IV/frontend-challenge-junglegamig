// Indicador de esqueleto Skeleton (shadcn/ui) adaptado para animação de shimmer compatível com prefers-reduced-motion.
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };
