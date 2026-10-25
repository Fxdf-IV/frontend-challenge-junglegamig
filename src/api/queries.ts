// Fábrica de query keys e opções do TanStack Query para catálogo e detalhe de NFTs.
import { queryOptions } from "@tanstack/react-query";
import { api } from "./endpoints";
import type { NftListParams } from "./types";

/**
 * Chaves de consulta do cache. Dados privados são prefixados por ["u", userId]
 * permitindo descarte imediato ao realizar logout ou troca de usuário.
 */
export const qk = {
  nfts: (p: NftListParams) => ["nfts", "list", p] as const,
  nft: (id: string) => ["nfts", "detail", id] as const,
  cart: (owner: string) => ["cart", owner] as const,
  favorites: (uid: string) => ["u", uid, "favorites"] as const,
  me: (uid: string) => ["u", uid, "me"] as const,
  wallets: (uid: string) => ["u", uid, "wallets"] as const,
  order: (uid: string, id: string) => ["u", uid, "order", id] as const,
};

/** Opções de consulta para lista paginada e filtrada de NFTs no catálogo. */
export const nftListQuery = (p: NftListParams) =>
  queryOptions({
    queryKey: qk.nfts(p),
    queryFn: ({ signal }) => api.listNfts(p, signal),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

/** Opções de consulta para os detalhes e edições de um NFT específico pelo seu slug ou ID. */
export const nftQuery = (id: string) =>
  queryOptions({
    queryKey: qk.nft(id),
    queryFn: ({ signal }) => api.getNft(id, signal),
    staleTime: 30_000,
    retry: (n, e) => (e as { status?: number }).status !== 404 && n < 2,
  });
