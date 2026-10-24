// Valida os dados de demonstração usados como referência visual do marketplace.
import { expect, test } from "bun:test";
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
  expect(emerald.name).toBe("Emerald Ape #042");
  expect(emerald.tokenId).toBe("#0042");
  expect(emerald.rating).toBe(4.8);
  expect(emerald.reviews).toBe(19);
  expect(emerald.gallery).toEqual(Array(4).fill(emerald.image));
});
