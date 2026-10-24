/** Typed REST + realtime contracts shared by the MSW mocks and the client. */
export type Network = "ethereum" | "polygon" | "solana";
export type Collection =
  | "arte-digital"
  | "fotografia"
  | "musica"
  | "arte-3d"
  | "colecionaveis"
  | "generativa"
  | "jogos"
  | "assinaturas"
  | "utilidade";
export type EditionKind = "1/1" | "1/10" | "1/50" | "aberta";

export interface Edition {
  kind: EditionKind;
  /** decimal ETH string */
  price: string;
  available: number;
  maxPerOrder: number;
}

export interface Nft {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  collection: Collection;
  collectionName: string;
  network: Network;
  creator: string;
  description: string;
  attributes: string[];
  tokenId: string;
  contract: string;
  rating: number;
  reviews: number;
  listedAt: string;
  trending: number;
  isNew: boolean;
  /** lowest edition price, decimal ETH string */
  price: string;
  compareAt?: string;
  editions: Edition[];
  version: number;
}

export type NftSort = "recent" | "price-asc" | "price-desc" | "name";
export interface NftListParams {
  q?: string;
  collections?: string[];
  networks?: string[];
  min?: string;
  max?: string;
  sort?: NftSort;
  tab?: "all" | "new" | "trending";
  page?: number;
  pageSize?: number;
}
export interface Facet {
  value: string;
  label: string;
  count: number;
}
export interface NftListResponse {
  items: Nft[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: { collections: Facet[]; networks: Facet[]; priceRange: { min: string; max: string } };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
}
export interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

export interface CartItem {
  nftId: string;
  edition: EditionKind;
  quantity: number;
  name: string;
  image: string;
  network: Network;
  unitPrice: string;
  available: number;
  maxPerOrder: number;
  /** set when price/availability changed since the item was added */
  notice?: string;
}
export interface Cart {
  id: string;
  items: CartItem[];
  version: number;
}

export interface QuoteLine {
  nftId: string;
  edition: EditionKind;
  name: string;
  image: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  available: number;
}
export interface QuoteIssue {
  nftId: string;
  edition: EditionKind;
  code: "PRICE_CHANGED" | "SOLD_OUT" | "INSUFFICIENT";
  message: string;
}
export interface Quote {
  id: string;
  lines: QuoteLine[];
  coupon?: { code: string; bps: number; label: string };
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  issues: QuoteIssue[];
  network: Network;
  expiresAt: string;
}

export type WalletProvider = "metamask" | "walletconnect" | "coinbase";
export interface Wallet {
  id: string;
  role: "primary" | "secondary";
  label: string;
  address: string;
  provider: WalletProvider;
  network: Network;
}

export type OrderStatus = "pending" | "confirmed" | "declined";
export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  lines: QuoteLine[];
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  coupon?: string;
  network: Network;
  wallet: { label: string; address: string; provider: WalletProvider };
  collector: { name: string; email: string; note?: string };
  txHash?: string;
  explorerUrl?: string;
  declineReason?: string;
}

export interface ApiErrorBody {
  error: {
    code:
      | "VALIDATION"
      | "SESSION_EXPIRED"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "AVAILABILITY"
      | "QUOTE_STALE"
      | "COUPON_INVALID"
      | "COUPON_EXPIRED"
      | "IDEMPOTENCY_CONFLICT"
      | "UNAVAILABLE";
    message: string;
    fields?: Record<string, string>;
    quote?: Quote;
  };
}

/** Realtime event envelope: stable id, affected resource and monotonic version. */
export interface RealtimeEvent<T> {
  eventId: string;
  type: "nft.updated" | "order.updated";
  resourceId: string;
  version: number;
  userId?: string;
  data: T;
}
export type NftUpdatedEvent = RealtimeEvent<Pick<Nft, "id" | "price" | "editions" | "version">>;
export type OrderUpdatedEvent = RealtimeEvent<Order>;

export type ScenarioId =
  | "default"
  | "slow"
  | "jitter"
  | "flaky"
  | "offline"
  | "server-error"
  | "empty"
  | "session-expired"
  | "favorite-fail"
  | "price-change"
  | "sold-out"
  | "order-timeout"
  | "payment-declined";
