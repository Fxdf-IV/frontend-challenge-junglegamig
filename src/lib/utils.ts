// Utilitários de manipulação de classes CSS combinando clsx e tailwind-merge.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes condicionais do Tailwind resolvendo conflitos de especificidade. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
