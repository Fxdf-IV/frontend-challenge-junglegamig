// Contratos REST e de tempo real compartilhados entre cliente e mocks.
/** Redes blockchain usadas nas obras e carteiras do marketplace. */
export type Network = "ethereum" | "polygon" | "solana";
/** Categorias de coleção aceitas pelo catálogo. */
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
/** Formatos de edição disponíveis para compra. */
export type EditionKind = "1/1" | "1/10" | "1/50" | "aberta";

/** Preço e disponibilidade de uma edição. Valores ETH permanecem decimais em texto. */
export interface Edition {
  kind: EditionKind;
  /** decimal ETH string */
  price: string;
  available: number;
  maxPerOrder: number;
}

/** Dados de uma obra listada no marketplace. */
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

/** Ordenações suportadas pelo catálogo. */
export type NftSort = "recent" | "price-asc" | "price-desc" | "name";
/** Parâmetros de busca, filtros e paginação do catálogo. */
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
/** Opção de filtro e quantidade de obras correspondentes. */
export interface Facet {
  value: string;
  label: string;
  count: number;
}
/** Página de resultados e facetas disponíveis no catálogo. */
export interface NftListResponse {
  items: Nft[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: { collections: Facet[]; networks: Facet[]; priceRange: { min: string; max: string } };
}

/** Conta pública do colecionador usada pela sessão e pelo perfil. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
  /** Parte local do nome ENS, antes do sufixo exibido na interface. */
  ensName?: string;
  /** Apelido da carteira principal mostrado no perfil do colecionador. */
  walletNickname?: string;
}
/** Token temporário de autenticação e conta associada. */
export interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

/** Linha do carrinho com preço e disponibilidade atuais da obra. */
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
/** Carrinho persistido e sua versão para reconciliação. */
export interface Cart {
  id: string;
  items: CartItem[];
  version: number;
}

/** Linha de cotação congelada para a revisão do pedido. */
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
/** Problema que impede confirmar a cotação atual. */
export interface QuoteIssue {
  nftId: string;
  edition: EditionKind;
  code: "PRICE_CHANGED" | "SOLD_OUT" | "INSUFFICIENT";
  message: string;
}
/** Valores calculados pelo servidor para confirmar uma compra. */
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

/** Provedores de carteira disponíveis no fluxo simulado. */
export type WalletProvider = "metamask" | "walletconnect" | "coinbase";
/** Carteira conectada à conta do colecionador. */
export interface Wallet {
  id: string;
  role: "primary" | "secondary";
  label: string;
  address: string;
  provider: WalletProvider;
  network: Network;
}

/** Estados terminais e pendentes de um pedido. */
export type OrderStatus = "pending" | "confirmed" | "declined";
/** Recibo imutável da compra e dados da carteira usada. */
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

/** Formato único de erro usado pelos endpoints REST. */
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
/** Evento com os dados de preço e disponibilidade atualizados de uma obra. */
export type NftUpdatedEvent = RealtimeEvent<Pick<Nft, "id" | "price" | "editions" | "version">>;
/** Evento com estado atualizado de um pedido. */
export type OrderUpdatedEvent = RealtimeEvent<Order>;

/** Cenários determinísticos disponíveis no serviço de mock. */
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
