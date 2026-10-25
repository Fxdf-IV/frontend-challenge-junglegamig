// Fixtures determinísticas da API simulada: catálogo, perfis, carteiras e valores do marketplace.
import type { Collection, Edition, EditionKind, Network, Nft, Wallet } from "@/api/types";

/** Nomes legíveis das categorias usadas em filtros e detalhes de NFT. */
export const COLLECTION_LABELS: Record<Collection, string> = {
  "arte-digital": "Arte digital",
  fotografia: "Fotografia",
  musica: "Música",
  "arte-3d": "Arte 3D",
  colecionaveis: "Colecionáveis",
  generativa: "Generativa",
  jogos: "Jogos",
  assinaturas: "Assinaturas",
  utilidade: "Utilidade",
};
/** Nomes das redes exibidos em carteiras, compra e metadados. */
export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

const ART = [
  { img: "/nft/emerald.webp", base: "Emerald Ape", attrs: ["Óculos", "Esmeralda", "Raro"] },
  { img: "/nft/sage.webp", base: "Sage Nomad", attrs: ["Chapéu", "Moletom", "Comum"] },
  { img: "/nft/neon.webp", base: "Neon Vessel", attrs: ["Blazer", "Gola alta", "Épico"] },
  { img: "/nft/golden.webp", base: "Golden Beat", attrs: ["Fones", "Dourado", "Lendário"] },
];
const NAMES = [
  "Emerald Ape",
  "Sage Nomad",
  "Neon Vessel",
  "Cosmic Bloom",
  "Violet Nomad",
  "Ivory Baron",
  "Golden Beat",
  "Golden Frequency",
  "Golden Signal",
  "Jade Monarch",
  "Velvet Drifter",
  "Onyx Curator",
  "Amber Pulse",
  "Moss Wanderer",
  "Ash Regent",
  "Copper Rhythm",
];
const COLLECTIONS = Object.keys(COLLECTION_LABELS) as Collection[];
const NETWORKS: Network[] = ["ethereum", "polygon", "solana"];
/** Números visíveis nos cards e no detalhe da seleção de referência do Figma. */
const FIGMA_SAMPLE_NUMBERS: Record<number, string> = {
  0: "042",
  1: "009",
  2: "552",
  3: "118",
  4: "314",
  5: "088",
  6: "207",
  7: "305",
  8: "160",
  17: "046",
};
const PRICES = [
  "1.19",
  "1.69",
  "1.99",
  "1.29",
  "1.39",
  "1.79",
  "0.99",
  "0.49",
  "0.39",
  "2.45",
  "3.10",
  "0.02",
  "5.75",
  "12.30",
  "0.85",
  "0.15",
];

/** Gerador pseudoaleatório determinístico para manter os dados estáveis entre resets e testes. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** Gera o catálogo local de forma estável para cenários e capturas reproduzíveis. */
export function buildNfts(): Nft[] {
  const r = rng(42);
  const list: Nft[] = [];
  // 40 itens formam o catálogo determinístico para testes e paginação estável.
  for (let i = 0; i < 40; i++) {
    const name = NAMES[i % NAMES.length];
    const artIdx =
      name.startsWith("Emerald") || name.startsWith("Jade") || name.startsWith("Amber")
        ? 0
        : name.includes("Nomad") ||
            name.includes("Bloom") ||
            name.includes("Moss") ||
            name.includes("Drifter")
          ? 1
          : name.includes("Golden") || name.includes("Copper")
            ? 3
            : 2;
    const art = ART[artIdx];
    const num = FIGMA_SAMPLE_NUMBERS[i] ?? String((i * 37 + 9) % 600).padStart(3, "0");
    const price = PRICES[i % PRICES.length];
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${num}`;
    const kinds: EditionKind[] = ["1/1", "1/10", "1/50", "aberta"];
    const editions: Edition[] = kinds.map((kind, k) => {
      const mult = [4, 2, 1, 0.5][k];
      const wei = Math.round(Number(price) * mult * 100);
      return {
        kind,
        price: (wei / 100).toFixed(2),
        available:
          kind === "1/1"
            ? i % 3 === 0
              ? 0
              : 1
            : kind === "1/10"
              ? 3 + (i % 5)
              : kind === "1/50"
                ? 12 + (i % 20)
                : 99,
        maxPerOrder: kind === "1/1" ? 1 : kind === "1/10" ? 3 : 5,
      };
    });
    // A edição "1/50" define o preço padrão de listagem exibido nos cards do catálogo.
    editions[2].price = price;
    const minPrice = editions.reduce(
      (m, e) => (Number(e.price) < Number(m) ? e.price : m),
      editions[0].price,
    );
    list.push({
      id,
      name: `${name} #${num}`,
      image: art.img,
      gallery: Array(4).fill(art.img),
      collection: COLLECTIONS[i % COLLECTIONS.length],
      collectionName: `Kurio ${name.split(" ")[1]}s`,
      network: NETWORKS[Math.floor(r() * 3)],
      creator: ["Nova Sato", "Iris Kahlo", "Theo Marin", "Luna Reyes"][i % 4],
      description: `${name} #${num} é uma obra digital finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na rede. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
      attributes: art.attrs,
      tokenId: FIGMA_SAMPLE_NUMBERS[i] ? `#0${num}` : `#${String(i + 1).padStart(4, "0")}`,
      contract: `0x${(0x7a42 + i * 113).toString(16).toUpperCase()}...${(0x19e8 + i * 7).toString(16).toUpperCase()}`,
      rating: i === 0 ? 4.8 : 4 + Math.round(r() * 10) / 10,
      reviews: i === 0 ? 19 : 3 + Math.floor(r() * 40),
      listedAt: new Date(Date.UTC(2026, 9, 20) - i * 3600_000 * 7).toISOString(),
      trending: Math.floor(r() * 1000),
      isNew: i % 4 === 1 || i < 3,
      price: minPrice === price ? price : price,
      compareAt: i % 7 === 2 ? (Number(price) + 0.3).toFixed(2) : undefined,
      editions,
      version: 1,
    });
  }
  return list;
}

/** Perfil persistido pelo mock, incluindo apenas o hash da senha. */
export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
  /** Parte local do nome ENS; a interface acrescenta o sufixo. */
  ensName?: string;
  /** Identificação da carteira principal no perfil público. */
  walletNickname?: string;
  /** Hash SHA-256 em hexadecimal de salt+senha; senhas em texto puro nunca são armazenadas. */
  passwordHash: string;
  salt: string;
}

/** Contas fictícias usadas somente para inicializar o serviço mock. */
export const SEED_USERS: Array<Omit<UserRecord, "passwordHash" | "salt"> & { password: string }> = [
  {
    id: "u_ana",
    email: "ana@kurio.dev",
    displayName: "Ana Sato",
    username: "anasato",
    password: "Kurio@123",
    bio: "Colecionadora de arte generativa.",
    ensName: "ana",
    walletNickname: "Ana principal",
  },
  {
    id: "u_bruno",
    email: "bruno@kurio.dev",
    displayName: "Bruno Lima",
    username: "brunolima",
    password: "Kurio@123",
    ensName: "bruno",
    walletNickname: "Bruno principal",
  },
];

/** Carteiras iniciais associadas às contas fictícias. */
export const SEED_WALLETS: Record<string, Wallet[]> = {
  u_ana: [
    {
      id: "w_ana_1",
      role: "primary",
      label: "Reserva",
      address: "0xA11CE0000000000000000000000000000000BEEF",
      provider: "metamask",
      network: "ethereum",
    },
  ],
  u_bruno: [],
};

/** Cupons válidos e expirados para exercitar o cálculo do pedido. */
export const COUPONS: Record<string, { bps: number; label: string; expired?: boolean }> = {
  KURIO10: { bps: 1000, label: "10% de desconto de lançamento" },
  WELCOME5: { bps: 500, label: "5% de boas-vindas" },
  VERAO25: { bps: 2500, label: "Cupom de verão", expired: true },
};

/** Taxas fictícias por rede, armazenadas como decimais de ETH. */
export const NETWORK_FEES: Record<Network, string> = {
  ethereum: "0.0042",
  polygon: "0.0008",
  solana: "0.0003",
};
