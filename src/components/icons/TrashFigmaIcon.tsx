// Ícone de lixeira outline com alça em arco conforme desenhado no Figma.
import type { SVGProps } from "react";

/**
 * Renderiza o ícone de exclusão do carrinho fiel ao vetor do Figma:
 * tampa reta com puxador em arco, cesto em U com cantos arredondados e sem linhas internas.
 */
export function TrashFigmaIcon({ className = "h-5 w-5", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M8.5 6a3.5 3.5 0 0 1 7 0" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <path d="M5.5 8.5v7.5a6 6 0 0 0 13 0V8.5" />
    </svg>
  );
}
