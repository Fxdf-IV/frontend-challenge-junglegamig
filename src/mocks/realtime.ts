// Servidor Socket.IO simulado sobre a interceptação de WebSocket do MSW.
import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import type { Nft, Order, RealtimeEvent } from "@/api/types";
import { db } from "./db";

type Conn = { io: ReturnType<typeof toSocketIo>; userId?: string; close: () => void };
const connections = new Set<Conn>();
const sent: RealtimeEvent<unknown>[] = [];
let refuseUntil = 0;

// O MSW remove o prefixo `/socket.io/` da URL antes de testar o padrão do handler,
// então casamos a origem WebSocket e filtramos `/socket.io` na conexão recebida.
const socketLink = ws.link(/^wss?:\/\/[^/]+\/?$/);

/** Intercepta conexões do socket.io-client, autentica a sessão e mantém o heartbeat. */
export const socketHandler = socketLink.addEventListener("connection", (connection) => {
  if (!connection.client.url.pathname.startsWith("/socket.io")) {
    connection.server.connect();
    return;
  }
  if (Date.now() < refuseUntil) {
    connection.client.close();
    return;
  }
  const io = toSocketIo(connection);
  const conn: Conn = { io, close: () => connection.client.close() };
  connections.add(conn);
  // Heartbeat do Engine.IO para evitar timeout na conexão simulada.
  const ping = setInterval(() => connection.client.send("2"), 20000);
  io.client.on("auth", (_e, payload: { token?: string }) => {
    const sess = payload?.token ? db().sessions[payload.token] : undefined;
    conn.userId = sess && sess.expiresAt > Date.now() ? sess.userId : undefined;
    io.client.emit("auth.ok", { userId: conn.userId ?? null });
  });
  connection.client.addEventListener("close", () => {
    clearInterval(ping);
    connections.delete(conn);
  });
});

function emit<T>(evt: RealtimeEvent<T>) {
  sent.push(evt as RealtimeEvent<unknown>);
  if (sent.length > 50) sent.shift();
  for (const c of connections) {
    // Eventos privados de pedido só são entregues às conexões autenticadas do mesmo usuário.
    if (evt.userId && c.userId !== evt.userId) continue;
    c.io.client.emit(evt.type, evt);
  }
}

/** Publica atualização de preço ou disponibilidade de um NFT para todos os clientes. */
export function emitNftUpdated(nft: Nft) {
  emit({
    eventId: crypto.randomUUID(),
    type: "nft.updated",
    resourceId: nft.id,
    version: nft.version,
    data: { id: nft.id, price: nft.price, editions: nft.editions, version: nft.version },
  });
}

/** Publica atualização de status de pedido restrita ao usuário dono da compra. */
export function emitOrderUpdated(order: Order, userId: string) {
  emit({
    eventId: crypto.randomUUID(),
    type: "order.updated",
    resourceId: order.id,
    version: order.version,
    userId,
    data: order,
  });
}

/** Reenvia o último evento (duplicado) ou uma versão anterior (obsoleto) para testes. */
export function replay(kind: "duplicate" | "stale") {
  const last = sent[sent.length - 1];
  if (!last) return false;
  if (kind === "duplicate") {
    for (const c of connections)
      if (!last.userId || c.userId === last.userId) c.io.client.emit(last.type, last);
  } else {
    const stale = { ...last, eventId: crypto.randomUUID(), version: Math.max(0, last.version - 1) };
    for (const c of connections)
      if (!last.userId || c.userId === last.userId) c.io.client.emit(stale.type, stale);
  }
  return true;
}

/** Derruba conexões ativas e recusa novas tentativas pelo período informado. */
export function dropConnections(refuseMs = 3000) {
  refuseUntil = Date.now() + refuseMs;
  for (const c of [...connections]) c.close();
}
