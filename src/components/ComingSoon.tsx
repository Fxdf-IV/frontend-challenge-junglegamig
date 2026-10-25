// Componente placeholder para seções fora do escopo funcional com indicação explícita.
import { Link } from "@tanstack/react-router";

/** Seções fora do escopo da demonstração com mensagem informativa e retorno ao mercado. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="container-page grid min-h-[50vh] place-items-center py-16 text-center">
      <div>
        <h1 className="text-2xl font-extrabold uppercase">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta seção ainda não está disponível nesta versão.
        </p>
        <Link
          to="/mercado"
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground"
        >
          Ir para o mercado
        </Link>
      </div>
    </section>
  );
}
