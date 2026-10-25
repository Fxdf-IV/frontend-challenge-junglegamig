// Botão padronizado "Explorar →" alinhado fielmente ao design do Figma.
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Propriedades do botão padronizado de exploração. */
export interface ExploreButtonProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode;
}

/**
 * Botão com cantos arredondados, fundo primário e seta à direita ("Explorar →").
 * Alinhado ao modelo do Figma para todas as chamadas de exploração do catálogo e mercado.
 */
export const ExploreButton = React.forwardRef<HTMLButtonElement, ExploreButtonProps>(
  ({ children, className, size = "default", ...props }, ref) => {
    return (
      <Button ref={ref} variant="explore" size={size} className={cn("gap-2", className)} {...props}>
        {children ?? (
          <>
            Explorar <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>
    );
  },
);
ExploreButton.displayName = "ExploreButton";
