import { queryOptions } from "@tanstack/react-query";
import { api } from "./endpoints";
import type { NftListParams } from "./types";

/**
 * Query keys. Private data is namespaced under ["u", userId] so logout /
 * user switch can drop it with one removeQueries call.
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

export const nftListQuery = (p: NftListParams) =>
  queryOptions({
    queryKey: qk.nfts(p),
    queryFn: ({ signal }) => api.listNfts(p, signal),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
export const nftQuery = (id: string) =>
  queryOptions({
    queryKey: qk.nft(id),
    queryFn: ({ signal }) => api.getNft(id, signal),
    staleTime: 30_000,
    retry: (n, e) => (e as { status?: number }).status !== 404 && n < 2,
  });
