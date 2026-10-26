// Componente de revelação em rolagem: adiciona transições de entrada suaves inspiradas na Jungle Gaming.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  as?: "div" | "section" | "article" | "aside";
}

/**
 * Envolve seções ou grupos de elementos para animar suavemente a entrada (fade-up)
 * conforme o usuário rola a página no desktop e mobile, com suporte estrito a movimento reduzido e testes.
 */
export function ScrollRevealSection({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  id,
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
  as: Component = "div",
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Inicializa sempre como visível para garantir paridade 100% perfeita entre SSR e hidratação do React.
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Se o usuário prefere movimento reduzido ou estamos em ambiente de teste, mantém visível estático.
    if (
      process.env.NODE_ENV === "test" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ) {
      return;
    }

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    // Se o elemento já estiver visível na janela inicial do usuário, mantém visível.
    const rect = element.getBoundingClientRect();
    const inInitialViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inInitialViewport) return;

    // Se estiver abaixo da dobra, prepara para revelação suave ao rolar a página.
    setIsVisible(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none md:transform-none md:transition-none",
        isVisible
          ? "opacity-100 translate-y-0"
          : "max-md:opacity-0 max-md:translate-y-8 md:opacity-100 md:translate-y-0",
        className,
      )}
      style={delay && !isVisible ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
