// Testes do componente AccountNav para navegação mobile (Sheet retrátil) e desktop.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountNav } from "@/components/AccountNav";

const mocks = vi.hoisted(() => ({
  pathname: "/perfil",
  signOut: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: mocks.pathname } }),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/session", () => ({
  useSession: () => ({
    user: { id: "u-ana", email: "ana@kurio.dev", displayName: "Ana" },
    signOut: mocks.signOut,
  }),
}));

describe("AccountNav", () => {
  it("exibe a seção atual no trigger mobile e a barra lateral desktop", () => {
    mocks.pathname = "/perfil";
    render(<AccountNav />);

    // Trigger mobile exibe o rótulo da seção atual
    expect(screen.getByText("Seção da conta")).toBeInTheDocument();
    expect(screen.getAllByText("Dados do perfil")[0]).toBeInTheDocument();

    // Barra lateral desktop possui cabeçalho acessível
    expect(screen.getByRole("navigation", { name: "Meu perfil" })).toBeInTheDocument();
  });

  it("abre a gaveta móvel com todas as seções e opção de logout ao clicar no trigger", () => {
    mocks.pathname = "/carteiras";
    render(<AccountNav />);

    const trigger = screen.getByRole("button", {
      name: /Seção atual: Carteiras/i,
    });
    fireEvent.click(trigger);

    // Gaveta móvel exibe o título e descrição acessíveis
    expect(screen.getByText("Navegação da conta")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma seção para navegar")).toBeInTheDocument();

    // Opções principais e ação de sair estão presentes
    expect(screen.getByText("Sair da conta")).toBeInTheDocument();
  });
});
