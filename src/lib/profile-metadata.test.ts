// Testes das regras compartilhadas dos campos ENS e apelido da carteira.
import { describe, expect, it } from "vitest";
import { validateProfileMetadata } from "@/lib/profile-metadata";
import { SEED_USERS } from "@/mocks/fixtures";

describe("validateProfileMetadata", () => {
  it("requires a short ENS label and a wallet nickname", () => {
    expect(validateProfileMetadata({ ensName: " ", walletNickname: "" })).toEqual({
      ensName: "Informe seu nome ENS",
      walletNickname: "Informe o apelido da carteira",
    });
  });

  it("accepts trimmed values within their field limits", () => {
    expect(validateProfileMetadata({ ensName: "ana", walletNickname: "Ana principal" })).toEqual(
      {},
    );
  });

  it("allows partial updates that leave profile metadata untouched", () => {
    expect(validateProfileMetadata({})).toEqual({});
  });

  it("provides metadata in the collector demo profile", () => {
    expect(SEED_USERS[0]).toMatchObject({ ensName: "ana", walletNickname: "Ana principal" });
  });
});
