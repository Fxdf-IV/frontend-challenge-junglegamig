// Testes da navegação entre login e cadastro na moldura de autenticação.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthShell } from "@/components/AuthShell";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    to,
    search,
    children,
    ...props
  }: {
    to: string;
    search?: { redirect?: string };
    children: React.ReactNode;
    className?: string;
    "aria-current"?: "page" | undefined;
  }) => (
    <a
      href={`${to}${search?.redirect ? `?redirect=${encodeURIComponent(search.redirect)}` : ""}`}
      {...props}
    >
      {children}
    </a>
  ),
}));

describe("AuthShell", () => {
  it("shows both auth routes and preserves the redirect in the inactive tab", () => {
    render(
      <AuthShell
        title="Criar perfil de colecionador"
        subtitle="Crie seu perfil de colecionador."
        activeMode="register"
        redirect="/checkout"
      >
        <p>Cadastro</p>
      </AuthShell>,
    );

    expect(screen.getByRole("navigation", { name: "Autenticação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fcheckout",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders a full-screen immersive presentation on mobile conforming to Figma frames", () => {
    render(
      <AuthShell title="Entrar" subtitle="Acesse sua conta." activeMode="login">
        <p>Login</p>
      </AuthShell>,
    );

    expect(screen.getByRole("dialog")).toHaveClass(
      "max-md:fixed",
      "max-md:inset-0",
      "max-md:w-full",
      "max-md:h-full",
      "max-md:bg-[#0c0805]",
      "max-md:rounded-none",
    );
    expect(screen.getByText("KURIO")).toBeInTheDocument();
  });
});
