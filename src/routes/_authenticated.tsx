// Layout protegido para rotas que exigem autenticação prévia do usuário.
// Redireciona para /login via beforeLoad do TanStack Router preservando a URL original.
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/session";
import { tokenStore } from "@/api/client";

/** Guarda de rotas autenticadas da aplicação via beforeLoad e verificação reativa de sessão. */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // No cliente, impede o carregamento da casca privada quando não há token no storage
    if (typeof window !== "undefined" && !tokenStore.get()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  component: AuthGuard,
});

function AuthGuard() {
  const { user, status } = useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  useEffect(() => {
    if (status === "ready" && !user && !href.startsWith("/login"))
      navigate({ to: "/login", search: { redirect: href }, replace: true });
  }, [href, navigate, status, user]);
  if (status === "loading")
    return (
      <div className="container-page py-10" aria-busy="true">
        <div className="shimmer h-64 rounded-lg" />
      </div>
    );
  if (!user) return null;
  return <Outlet />;
}
