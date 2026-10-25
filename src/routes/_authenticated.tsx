import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/session";

/** Guards private flows. Session lives client-side (mock API), so the guard runs after hydration. */
export const Route = createFileRoute("/_authenticated")({
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
