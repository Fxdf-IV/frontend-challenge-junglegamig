// Provedor de eventos em tempo real via Socket.IO com deduplicação, controle de versão e reconciliação REST.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Cart,
  Nft,
  NftListResponse,
  NftUpdatedEvent,
  Order,
  OrderUpdatedEvent,
} from "@/api/types";
import { tokenStore } from "@/api/client";
import { createEventGuard } from "./event-guard";
import { useSession } from "./session";

type Status = "connecting" | "connected" | "disconnected";
const Ctx = createContext<{ status: Status; announce: string }>({
  status: "connecting",
  announce: "",
});

/**
 * Mantém uma conexão Socket.IO por aba. Eventos trazem eventId e version;
 * duplicatas e versões antigas são ignoradas. Ao reconectar, recursos ativos
 * são reconciliados via REST por invalidação de queries.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { user } = useSession();
  const userRef = useRef(user?.id ?? null);
  userRef.current = user?.id ?? null;
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const fresh = createEventGuard();

    let cancelled = false;
    let cleanupSocket: (() => void) | undefined;

    // Importa socket.io-client após o MocksGate iniciar o MSW para que o engine.io-client
    // capture o globalThis.WebSocket já interceptado pelo WebSocketInterceptor.
    void import("socket.io-client").then(({ io }) => {
      if (cancelled) return;
      const s = io({
        path: "/socket.io/",
        transports: ["websocket"],
        reconnectionDelay: 800,
        reconnectionDelayMax: 3000,
      });
      socketRef.current = s;
      let connectedOnce = false;
      s.on("connect", () => {
        setStatus("connected");
        s.emit("auth", { token: tokenStore.get() });
        if (connectedOnce) {
          qc.invalidateQueries({ queryKey: ["nfts"] });
          qc.invalidateQueries({ queryKey: ["cart"] });
          qc.invalidateQueries({ queryKey: ["u"], predicate: (q) => q.queryKey[2] === "order" });
          setAnnounce("Conexão em tempo real restabelecida");
        }
        connectedOnce = true;
      });
      s.on("disconnect", () => setStatus("disconnected"));
      s.io.on("reconnect_attempt", () => setStatus("connecting"));

      s.on("nft.updated", (e: NftUpdatedEvent) => {
        if (!fresh(e)) return;
        const patch = (n: Nft): Nft =>
          n.id === e.resourceId && n.version < e.version ? { ...n, ...e.data } : n;
        qc.setQueryData<Nft>(["nfts", "detail", e.resourceId], (old) => (old ? patch(old) : old));
        qc.setQueriesData<NftListResponse>({ queryKey: ["nfts", "list"] }, (old) =>
          old ? { ...old, items: old.items.map(patch) } : old,
        );
        const carts = qc.getQueriesData<Cart>({ queryKey: ["cart"] });
        const inCart = carts.some(([, c]) => c?.items.some((i) => i.nftId === e.resourceId));
        if (inCart) {
          qc.invalidateQueries({ queryKey: ["cart"] });
          qc.invalidateQueries({ queryKey: ["quote"] });
          const msg = "Um NFT do seu carrinho teve preço ou disponibilidade alterados";
          toast.info(msg);
          setAnnounce(msg);
        }
      });

      s.on("order.updated", (e: OrderUpdatedEvent) => {
        if (!userRef.current || e.userId !== userRef.current) return; // nunca aplica evento de outro usuário
        if (!fresh(e)) return;
        qc.setQueryData<Order>(["u", userRef.current, "order", e.resourceId], (old) =>
          !old || old.version < e.version ? e.data : old,
        );
        if (e.data.status === "confirmed") qc.invalidateQueries({ queryKey: ["cart"] });
        setAnnounce(
          e.data.status === "confirmed"
            ? "Pedido confirmado"
            : e.data.status === "declined"
              ? "Pedido recusado"
              : "Pedido atualizado",
        );
      });

      cleanupSocket = () => {
        s.removeAllListeners();
        s.io.removeAllListeners();
        s.disconnect();
        socketRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanupSocket?.();
    };
  }, [qc]);

  // Reautentica o socket quando o usuário muda; o servidor filtra eventos de pedido por usuário
  useEffect(() => {
    socketRef.current?.emit("auth", { token: tokenStore.get() });
  }, [user?.id]);

  return (
    <Ctx.Provider value={{ status, announce }}>
      {children}
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
    </Ctx.Provider>
  );
}

/** Retorna o estado da conexão Socket.IO e o último anúncio acessível. */
export const useRealtime = () => useContext(Ctx);
