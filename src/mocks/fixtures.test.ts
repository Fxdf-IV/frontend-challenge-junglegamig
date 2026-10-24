// Valida os dados de demonstração usados como referência visual do marketplace.
import { expect, test } from "vitest";
import { buildNfts } from "./fixtures";

test("mantém os dados e as imagens do NFT de referência alinhados ao Figma", () => {
  const nfts = buildNfts();
  const emerald = nfts[0];

  expect(nfts.slice(0, 8).map((nft) => nft.name)).toEqual([
    "Emerald Ape #042",
    "Sage Nomad #009",
    "Neon Vessel #083",
    "Golden Beat #207",
    "Cosmic Bloom #118",
    "Violet Nomad #314",
    "Ivory Baron #088",
    "Golden Signal #160",
  ]);
  expect(nfts.slice(0, 8).map((nft) => nft.price)).toEqual([
    "1.19",
    "1.69",
    "1.99",
    "0.99",
    "1.29",
    "1.39",
    "1.79",
    "0.39",
  ]);
  expect(emerald.name).toBe("Emerald Ape #042");
  expect(emerald.tokenId).toBe("#0042");
  expect(emerald.rating).toBe(4.8);
  expect(emerald.reviews).toBe(19);
  expect(emerald.gallery).toEqual(Array(4).fill(emerald.image));
  expect(nfts[17].name).toBe("Sage Nomad #046");
  expect(nfts[17].tokenId).toBe("#0046");
});
