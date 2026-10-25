// Rótulos amigáveis para redes blockchain, provedores de carteira e abreviação de endereços.
import type { Network, WalletProvider } from "@/api/types";

/** Rótulos das redes blockchain suportadas na interface. */
export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

/** Nomes de exibição dos provedores de carteiras Web3 suportados. */
export const PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
};

/** Abrevia um endereço hexadecimal longo para o formato legível 0x1234…5678. */
export const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
