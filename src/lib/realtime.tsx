import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Cart, Nft, NftListResponse, NftUpdatedEvent, Order, OrderUpdatedEvent } from "@/api/types";
import { tokenStore } from "@/api/client";
import { useSession } from "./session";

type Status = "connecting" | "connected" | "disconnected";
const Ctx = createContext<{ status: Status; announce: string }>({ status: "connecting", announce: "" });

/**
 * One socket.io-client connection per browser tab. Events carry eventId +
 * version; duplicates and older versions are ignored. On reconnect, active
 * resources are reconciled through REST via query invalidation.
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
    const seen = new Set<string>();
    const versions = new Map<string, number>();
    const fresh = (e: { eventId: string; resourceId: string; version: number; type: string }) => {
      if (seen.has(e.eventId)) return false;
      seen.add(e.eventId);
      const k = `${e.type}:${e.resourceId}`;
      if ((versions.get(k) ?? 0) >= e.version) return false;
      versions.set(k, e.version);
      return true;
    };

    const s = io({ path: "/socket.io/", transports: ["websocket"], reconnectionDelay: 800, reconnectionDelayMax: 3000 });
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
      const patch = (n: Nft): Nft => (n.id === e.resourceId && n.version < e.version ? { ...n, ...e.data } : n);
      qc.setQueryData<Nft>(["nfts", "detail", e.resourceId], (old) => (old ? patch(old) : old));
      qc.setQueriesData<NftListResponse>({ queryKey: ["nfts", "list"] }, (old) => (old ? { ...old, items: old.items.map(patch) } : old));
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
      if (!userRef.current || e.userId !== userRef.current) return; // never apply another user's event
      if (!fresh(e)) return;
      qc.setQueryData<Order>(["u", userRef.current, "order", e.resourceId], (old) => (!old || old.version < e.version ? e.data : old));
      if (e.data.status === "confirmed") qc.invalidateQueries({ queryKey: ["cart"] });
      setAnnounce(e.data.status === "confirmed" ? "Pedido confirmado" : e.data.status === "declined" ? "Pedido recusado" : "Pedido atualizado");
    });

    return () => {
      s.removeAllListeners();
      s.io.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [qc]);

  // re-authenticate the socket when the user changes; server scopes order events per user
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

export const useRealtime = () => useContext(Ctx);
