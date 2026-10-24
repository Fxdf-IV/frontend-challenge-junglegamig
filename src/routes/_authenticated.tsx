import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useSession } from "@/lib/session";

/** Guards private flows. Session lives client-side (mock API), so the guard runs after hydration. */
export const Route = createFileRoute("/_authenticated")({
  component: AuthGuard,
});

function AuthGuard() {
  const { user, status } = useSession();
  const href = useRouterState({ select: (s) => s.location.href });
  if (status === "loading")
    return (
      <div className="container-page py-10" aria-busy="true">
        <div className="shimmer h-64 rounded-lg" />
      </div>
    );
  if (!user) return <Navigate to="/login" search={{ redirect: href }} replace />;
  return <Outlet />;
}
