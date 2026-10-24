import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import type { Nft, Order, RealtimeEvent } from "@/api/types";
import { db } from "./db";

/**
 * Socket.IO server simulated through MSW's WebSocket interception plus
 * @mswjs/socket.io-binding. The client is the real socket.io-client using
 * the websocket transport only (long-polling is not intercepted here).
 */
type Conn = { io: ReturnType<typeof toSocketIo>; userId?: string; close: () => void };
const connections = new Set<Conn>();
const sent: RealtimeEvent<unknown>[] = [];
let refuseUntil = 0;

const socketLink = ws.link(/\/socket\.io\//);

export const socketHandler = socketLink.addEventListener("connection", (connection) => {
  if (Date.now() < refuseUntil) {
    connection.client.close();
    return;
  }
  const io = toSocketIo(connection);
  const conn: Conn = { io, close: () => connection.client.close() };
  connections.add(conn);
  // engine.io heartbeat so the client does not time out
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
    if (evt.userId && c.userId !== evt.userId) continue; // user isolation
    c.io.client.emit(evt.type, evt);
  }
}

export function emitNftUpdated(nft: Nft) {
  emit({
    eventId: crypto.randomUUID(),
    type: "nft.updated",
    resourceId: nft.id,
    version: nft.version,
    data: { id: nft.id, price: nft.price, editions: nft.editions, version: nft.version },
  });
}

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

/** Dev tooling: resend the last event (duplicate) or an older one (stale). */
export function replay(kind: "duplicate" | "stale") {
  const last = sent[sent.length - 1];
  if (!last) return false;
  if (kind === "duplicate") {
    for (const c of connections) if (!last.userId || c.userId === last.userId) c.io.client.emit(last.type, last);
  } else {
    const stale = { ...last, eventId: crypto.randomUUID(), version: Math.max(0, last.version - 1) };
    for (const c of connections) if (!last.userId || c.userId === last.userId) c.io.client.emit(stale.type, stale);
  }
  return true;
}

export function dropConnections(refuseMs = 3000) {
  refuseUntil = Date.now() + refuseMs;
  for (const c of [...connections]) c.close();
}
