// Rota pública de login; preserva o destino original após autenticar.
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { LoginForm } from "@/components/AuthForms";
import { safeRedirect } from "@/lib/redirect";
import { AuthShell } from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  validateSearch: zodValidator(
    z.object({
      redirect: z.string().optional().catch(undefined),
      expired: z.boolean().optional().catch(undefined),
    }),
  ),
  head: () => ({
    meta: [
      { title: "Entrar — Kurio" },
      { name: "description", content: "Acesse sua conta de colecionador Kurio." },
      { property: "og:title", content: "Entrar — Kurio" },
      { property: "og:description", content: "Acesse sua conta Kurio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

/** Apresenta o formulário de login e conclui o retorno seguro à rota solicitada. */
function LoginPage() {
  const { redirect, expired } = Route.useSearch();
  const router = useRouter();
  return (
    <AuthShell
      title="Entrar"
      subtitle="Entre para gerenciar sua carteira, coleção e perfil de criador."
      activeMode="login"
      redirect={redirect}
    >
      <LoginForm expired={expired} onDone={() => router.history.push(safeRedirect(redirect))} />
      <p className="mt-6 text-center text-xs text-muted-foreground md:hidden">
        Novo na Kurio?{" "}
        <Link
          to="/cadastro"
          search={{ redirect }}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Crie uma conta
        </Link>
      </p>
    </AuthShell>
  );
}
