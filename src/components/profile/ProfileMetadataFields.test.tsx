// Testes dos campos ENS e apelido da carteira na tela de perfil.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileMetadataFields } from "@/components/profile/ProfileMetadataFields";

describe("ProfileMetadataFields", () => {
  it("shows the ENS suffix selector and the wallet nickname field", () => {
    render(
      <ProfileMetadataFields
        ensName="ana"
        walletNickname="Ana principal"
        errors={{}}
        onEnsNameChange={vi.fn()}
        onWalletNicknameChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Nome ENS *")).toHaveValue("ana");
    expect(screen.getByLabelText("Sufixo ENS")).toHaveValue(".eth");
    expect(screen.getByLabelText("Apelido da carteira *")).toHaveValue("Ana principal");
  });
});
