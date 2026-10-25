// Testes dos formulários de login e cadastro e do contrato enviado à API.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm, RegisterForm } from "@/components/AuthForms";

const mocks = vi.hoisted(() => ({ register: vi.fn(), signIn: vi.fn() }));

vi.mock("@/api/endpoints", () => ({ api: { register: mocks.register } }));
vi.mock("@/lib/session", () => ({ useSession: () => ({ signIn: mocks.signIn }) }));

describe("RegisterForm", () => {
  beforeEach(() => {
    mocks.register.mockReset();
    mocks.signIn.mockReset();
    mocks.register.mockResolvedValue({ token: "session" });
    mocks.signIn.mockResolvedValue(undefined);
  });

  it("uses the four designed fields and derives the display name from username", async () => {
    const onDone = vi.fn();
    const { container } = render(<RegisterForm onDone={onDone} />);

    expect(container.querySelectorAll("input")).toHaveLength(4);
    fireEvent.change(screen.getByLabelText("Nome de usuário"), { target: { value: "vi_sato" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "vi@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Colecionador1" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "Colecionador1" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Criar conta" }).closest("form")!);

    await waitFor(() => expect(mocks.register).toHaveBeenCalledOnce());
    expect(mocks.register).toHaveBeenCalledWith({
      displayName: "vi_sato",
      username: "vi_sato",
      email: "vi@example.com",
      password: "Colecionador1",
    });
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("styles fields and social buttons for mobile conforming to Figma frames", () => {
    const { container } = render(<RegisterForm onDone={vi.fn()} />);

    expect(container.querySelector("form")).toHaveClass("max-md:mt-2", "max-md:space-y-3");
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toHaveClass(
      "max-md:h-12",
      "max-md:rounded-xl",
    );
    expect(screen.getByRole("button", { name: "Continuar com Facebook" })).toHaveClass(
      "max-md:h-12",
      "max-md:rounded-xl",
    );
  });

  it("renders the Figma login placeholders and social buttons with SVG icons", () => {
    render(<LoginForm onDone={vi.fn()} />);

    expect(screen.getByPlaceholderText("contato@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("***********")).toBeInTheDocument();
    expect(screen.getByText("Ou continue com")).toBeInTheDocument();

    const googleBtn = screen.getByRole("button", { name: "Continuar com Google" });
    const facebookBtn = screen.getByRole("button", { name: "Continuar com Facebook" });
    expect(googleBtn.querySelector("svg")).not.toBeNull();
    expect(facebookBtn.querySelector("svg")).not.toBeNull();
  });
});
