// Testes do formulário de cadastro e do contrato enviado à API.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/AuthForms";

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

  it("compacts fields and social buttons for the mobile auth card", () => {
    const { container } = render(<RegisterForm onDone={vi.fn()} />);

    expect(container.querySelector("form")).toHaveClass(
      "max-md:mt-4",
      "max-md:space-y-2",
      "max-md:[&_input]:h-9",
    );
    expect(screen.getByRole("button", { name: "Google" })).toHaveClass("max-md:h-7");
    expect(screen.getByRole("button", { name: "Facebook" })).toHaveClass("max-md:h-7");
  });
});
