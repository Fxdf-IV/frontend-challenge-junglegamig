// Provedor de contexto de autenticação de sessão do usuário no marketplace.
// Coordena token JWT, unificação de carrinho convidado após login, expiração e logout.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import { clearGuestCart, guestCartId, onSessionExpired, tokenStore } from "@/api/client";
import type { Session, User } from "@/api/types";
import { qk } from "@/api/queries";

interface SessionCtx {
  user: User | null;
  status: "loading" | "ready";
  signIn: (s: Session) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (u: User) => void;
}
const Ctx = createContext<SessionCtx | null>(null);

/** Provedor de estado de sessão global da aplicação. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const locRef = useRef(location);
  locRef.current = location;
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  // Limpa dados privados em cache ao trocar de conta ou encerrar a sessão.
  const clearPrivate = useCallback(() => {
    qc.removeQueries({ queryKey: ["u"] });
    qc.removeQueries({ queryKey: ["cart"] });
  }, [qc]);

  useEffect(() => {
    if (!tokenStore.get()) {
      setStatus("ready");
      return;
    }
    api
      .session()
      .then((s) => setUserState(s.user))
      .catch(() => tokenStore.set(null))
      .finally(() => setStatus("ready"));
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        tokenStore.set(null);
        clearPrivate();
        setUserState(null);
        toast.error("Sua sessão expirou. Entre novamente para continuar.");
        const l = locRef.current;
        if (!l.pathname.startsWith("/login"))
          navigate({ to: "/login", search: { redirect: l.href, expired: true } });
      }),
    [clearPrivate, navigate],
  );

  // Usa flushSync ao atualizar o usuário para que o AuthGuard veja a sessão antes do redirecionamento pós-login.
  const signIn = useCallback(
    async (s: Session) => {
      const guest = guestCartId();
      clearPrivate();
      tokenStore.set(s.token);
      try {
        const merged = await api.mergeCart(guest);
        qc.setQueryData(qk.cart(s.user.id), merged);
      } catch {
        /* cart refetches on demand */
      }
      clearGuestCart();
      flushSync(() => {
        setUserState(s.user);
      });
    },
    [qc, clearPrivate],
  );

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* token is discarded locally regardless */
    }
    tokenStore.set(null);
    clearPrivate();
    setUserState(null);
    toast.success("Você saiu da sua conta");
  }, [clearPrivate]);

  const value = useMemo(
    () => ({ user, status, signIn, signOut, setUser: setUserState }),
    [user, status, signIn, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Hook para consumir a sessão atual, usuário autenticado e ações de login/logout. */
export function useSession() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSession outside SessionProvider");
  return c;
}
