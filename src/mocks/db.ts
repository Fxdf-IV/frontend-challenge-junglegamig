import type { Cart, CartItem, Nft, Order, ScenarioId, Wallet } from "@/api/types";
import { buildNfts, SEED_USERS, SEED_WALLETS, type UserRecord } from "./fixtures";

/**
 * Mock "server" state. Persisted to localStorage so refresh keeps state;
 * resetDb() restores the deterministic seed.
 */
export interface DbState {
  seedVersion: number;
  nfts: Nft[];
  users: UserRecord[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
  favorites: Record<string, string[]>;
  /** carts keyed by cart id; user carts keyed by `user:<id>` */
  carts: Record<string, Cart>;
  wallets: Record<string, Wallet[]>;
  orders: Record<string, Order & { userId: string; resolveAt: number; outcome: "confirmed" | "declined" }>;
  idempotency: Record<string, { userId: string; hash: string; orderId: string }>;
  scenario: ScenarioId;
  counters: { requests: number };
}

const KEY = "kurio.mockdb.v1";
const SEED_VERSION = 3;
let state: DbState | null = null;

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function seed(scenario: ScenarioId = "default"): Promise<DbState> {
  const users: UserRecord[] = [];
  for (const u of SEED_USERS) {
    const salt = `salt-${u.id}`;
    const { password, ...rest } = u;
    users.push({ ...rest, salt, passwordHash: await sha256(salt + password) });
  }
  return {
    seedVersion: SEED_VERSION,
    nfts: buildNfts(),
    users,
    sessions: {},
    favorites: { u_ana: ["emerald-ape-009"], u_bruno: [] },
    carts: {},
    wallets: structuredClone(SEED_WALLETS),
    orders: {},
    idempotency: {},
    scenario,
    counters: { requests: 0 },
  };
}

export async function loadDb(): Promise<DbState> {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DbState;
      if (parsed.seedVersion === SEED_VERSION) state = parsed;
    }
  } catch {
    /* corrupted storage: reseed */
  }
  if (!state) {
    state = await seed();
    save();
  }
  return state;
}

export function db(): DbState {
  if (!state) throw new Error("Mock DB not loaded");
  return state;
}

export function save() {
  if (state) localStorage.setItem(KEY, JSON.stringify(state));
}

export async function resetDb(scenario: ScenarioId = "default") {
  state = await seed(scenario);
  save();
}

export function cartFor(key: string): Cart {
  const s = db();
  if (!s.carts[key]) s.carts[key] = { id: key, items: [], version: 1 };
  return s.carts[key];
}

/** Re-sync cart line prices/availability with the catalog, flagging changes. */
export function refreshCart(cart: Cart): Cart {
  const s = db();
  cart.items = cart.items.map((it): CartItem => {
    const nft = s.nfts.find((n) => n.id === it.nftId);
    const ed = nft?.editions.find((e) => e.kind === it.edition);
    if (!nft || !ed) return { ...it, available: 0, notice: "Item indisponível" };
    let notice = it.notice;
    if (ed.price !== it.unitPrice) notice = `Preço atualizado de ${it.unitPrice} para ${ed.price} ETH`;
    if (ed.available < it.quantity) notice = ed.available === 0 ? "Edição esgotada" : `Apenas ${ed.available} disponível(is)`;
    return { ...it, unitPrice: ed.price, available: ed.available, maxPerOrder: ed.maxPerOrder, notice };
  });
  return cart;
}
