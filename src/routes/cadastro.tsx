import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { RegisterForm } from "@/components/AuthForms";
import { safeRedirect } from "@/lib/redirect";
import { AuthShell } from "@/components/AuthShell";

export const Route = createFileRoute("/cadastro")({
  validateSearch: zodValidator(z.object({ redirect: z.string().optional().catch(undefined) })),
  head: () => ({
    meta: [
      { title: "Criar conta — Kurio" },
      { name: "description", content: "Crie seu perfil de colecionador na Kurio." },
      { property: "og:title", content: "Criar conta — Kurio" },
      { property: "og:description", content: "Crie seu perfil de colecionador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();
  return (
    <AuthShell title="Criar perfil de colecionador" subtitle="Leva menos de um minuto.">
      <RegisterForm onDone={() => router.history.push(safeRedirect(redirect))} />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          to="/login"
          search={{ redirect }}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
