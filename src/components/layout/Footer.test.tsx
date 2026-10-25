// Testes unitários do rodapé da aplicação (Footer) validando fidelidade às colunas e opções do Figma.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    search,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    search?: Record<string, unknown>;
    [key: string]: unknown;
  }) => (
    <a href={to} data-search={JSON.stringify(search)} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  it("renderiza exatamente as 5 opções em cada uma das três colunas do Figma", () => {
    render(<Footer />);

    // Coluna 1: Meu perfil
    expect(screen.getByRole("heading", { name: "Meu perfil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meu perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minha coleção" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atividade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Estúdio do criador" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lista de interesse" })).toBeInTheDocument();

    // Coluna 2: Central de ajuda
    expect(screen.getByRole("heading", { name: "Central de ajuda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Central de ajuda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Como comprar NFTs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carteira e segurança" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Política do mercado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Denunciar item" })).toBeInTheDocument();

    // Coluna 3: Coleções
    expect(screen.getByRole("heading", { name: "Coleções" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Arte digital" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fotografia" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Música" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Arte 3D" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Utilidade" })).toBeInTheDocument();

    // Coluna 4: Redes sociais e Carteiras compatíveis
    expect(screen.getByRole("heading", { name: "Redes sociais" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Carteiras compatíveis" })).toBeInTheDocument();
    expect(screen.getByText("METAMASK")).toBeInTheDocument();
    expect(screen.getByText("WALLETCONNECT")).toBeInTheDocument();
    expect(screen.getByText("COINBASE")).toBeInTheDocument();

    // Cards institucionais superiores com ícones temáticos
    expect(screen.getByRole("heading", { name: "Segurança da carteira" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Criadores em destaque" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alertas de lançamentos" })).toBeInTheDocument();
  });

  it("informa adequadamente ao usuário quando itens fora do escopo são acionados", () => {
    render(<Footer />);

    fireEvent.click(screen.getByRole("button", { name: "Minha coleção" }));
    expect(toast.info).toHaveBeenCalledWith(
      "Minha coleção: funcionalidade indisponível no momento",
    );

    fireEvent.click(screen.getByRole("button", { name: "Atividade" }));
    expect(toast.info).toHaveBeenCalledWith("Atividade: funcionalidade indisponível no momento");

    fireEvent.click(screen.getByRole("button", { name: "Denunciar item" }));
    expect(toast.info).toHaveBeenCalledWith(
      "Denunciar item: funcionalidade indisponível no momento",
    );
  });
});
