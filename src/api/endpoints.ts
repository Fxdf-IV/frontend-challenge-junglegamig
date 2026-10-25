// Endpoints REST do cliente HTTP: cataloga rotas de NFTs, autenticação, carrinho, checkout e mocks.
import { call, http } from "./client";
import type {
  Cart,
  EditionKind,
  Network,
  Nft,
  NftListParams,
  NftListResponse,
  Order,
  Quote,
  Session,
  User,
  Wallet,
} from "./types";

/** Coleção de métodos tipados para consumo de todos os recursos da API REST do marketplace. */
export const api = {
  listNfts: (p: NftListParams, signal?: AbortSignal) => {
    const sp = new URLSearchParams();
    if (p.q) sp.set("q", p.q);
    p.collections?.forEach((c) => sp.append("collection", c));
    p.networks?.forEach((n) => sp.append("network", n));
    if (p.min) sp.set("min", p.min);
    if (p.max) sp.set("max", p.max);
    if (p.sort) sp.set("sort", p.sort);
    if (p.tab) sp.set("tab", p.tab);
    sp.set("page", String(p.page ?? 1));
    sp.set("pageSize", String(p.pageSize ?? 9));
    return call(http.get<NftListResponse>(`/nfts?${sp}`, { signal }));
  },
  getNft: (id: string, signal?: AbortSignal) =>
    call(http.get<Nft>(`/nfts/${encodeURIComponent(id)}`, { signal })),

  register: (b: { displayName: string; email: string; username: string; password: string }) =>
    call(http.post<Session>("/auth/register", b)),
  login: (b: { email: string; password: string }) => call(http.post<Session>("/auth/login", b)),
  session: () => call(http.get<Session>("/auth/session")),
  logout: () => call(http.post<void>("/auth/logout")),

  favorites: () => call(http.get<{ ids: string[] }>("/favorites")),
  addFavorite: (id: string) => call(http.put<{ ids: string[] }>(`/favorites/${id}`)),
  removeFavorite: (id: string) => call(http.delete<{ ids: string[] }>(`/favorites/${id}`)),

  cart: () => call(http.get<Cart>("/cart")),
  addToCart: (b: { nftId: string; edition: EditionKind; quantity: number }) =>
    call(http.post<Cart>("/cart/items", b)),
  updateCartItem: (b: { nftId: string; edition: EditionKind; quantity: number }) =>
    call(http.patch<Cart>("/cart/items", b)),
  removeCartItem: (b: { nftId: string; edition: EditionKind }) =>
    call(
      http.delete<Cart>(`/cart/items?nftId=${b.nftId}&edition=${encodeURIComponent(b.edition)}`),
    ),
  mergeCart: (guestCartId: string) => call(http.post<Cart>("/cart/merge", { guestCartId })),

  quote: (b: { coupon?: string; network: Network }) => call(http.post<Quote>("/quote", b)),

  createOrder: (
    key: string,
    b: {
      quoteId: string;
      walletId: string;
      network: Network;
      coupon?: string;
      collector: { name: string; email: string; note?: string };
    },
  ) => call(http.post<Order>("/orders", b, { headers: { "Idempotency-Key": key } })),
  order: (id: string) => call(http.get<Order>(`/orders/${id}`)),

  me: () => call(http.get<User>("/me")),
  updateMe: (b: Partial<User>) => call(http.patch<User>("/me", b)),
  changePassword: (b: { current: string; next: string }) =>
    call(http.post<void>("/me/password", b)),

  wallets: () => call(http.get<{ items: Wallet[] }>("/wallets")),
  createWallet: (b: Omit<Wallet, "id">) => call(http.post<Wallet>("/wallets", b)),
  updateWallet: (id: string, b: Partial<Wallet>) => call(http.patch<Wallet>(`/wallets/${id}`, b)),

  mock: {
    scenario: () => call(http.get<{ scenario: string }>("/__mock/scenario")),
    setScenario: (scenario: string) => call(http.post("/__mock/scenario", { scenario })),
    reset: () => call(http.post("/__mock/reset", {})),
    nftUpdate: (b: { nftId: string; edition?: EditionKind; price?: string; available?: number }) =>
      call(http.post("/__mock/nft-update", b)),
    socket: (action: "drop" | "duplicate" | "stale") =>
      call(http.post("/__mock/socket", { action })),
  },
};
