// Componente de campo de formulário com rótulo, dicas e tratamento acessível de erros via ARIA.
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Classes base de estilização para campos de entrada de texto. */
export const inputClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground aria-[invalid=true]:border-destructive";

/** Campo com label, suporte a ícone/conteúdo embutido e associação de erro via aria-describedby. */
export function Field({
  label,
  error,
  hint,
  className,
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={[error && errId, hint && hintId].filter(Boolean).join(" ") || undefined}
          className={inputClass}
          {...props}
        />
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Caixa de alerta para mensagens de erro gerais de formulário com role="alert". */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn("rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs")}
    >
      {message}
    </p>
  );
}
