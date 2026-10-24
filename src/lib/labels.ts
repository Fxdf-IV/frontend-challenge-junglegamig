import type { Network, WalletProvider } from "@/api/types";

export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};
export const PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
};
export const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
