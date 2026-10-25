// Testes da rota do carrinho: garante que cupons inválidos ou expirados exibem erro sem travar o botão de checkout.
import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import type { Cart, Quote } from "@/api/types";
import { Route } from "@/routes/carrinho";

const mocks = vi.hoisted(() => ({
  quote: vi.fn(),
  navigate: vi.fn(),
  updateMutate: vi.fn(),
  removeMutate: vi.fn(),
}));

const sampleCart: Cart = {
  id: "cart-u-ana",
  version: 1,
  items: [
    {
      nftId: "emerald-ape-042",
      edition: "1/50",
      quantity: 1,
      name: "Emerald Ape #042",
      image: "/nft/emerald.webp",
      unitPrice: "1.19",
      available: 5,
      maxPerOrder: 5,
      network: "ethereum",
    },
  ],
};

const baseQuote: Quote = {
  id: "q-base",
  network: "ethereum",
  lines: [
    {
      nftId: "emerald-ape-042",
      edition: "1/50",
      name: "Emerald Ape #042",
      image: "/nft/emerald.webp",
      quantity: 1,
      unitPrice: "1.19",
      lineTotal: "1.19",
      available: 5,
    },
  ],
  subtotal: "1.19",
  discount: "0",
  networkFee: "0.05",
  total: "1.24",
  issues: [],
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

const discountQuote: Quote = {
  ...baseQuote,
  id: "q-kurio10",
  discount: "0.119",
  total: "1.121",
  coupon: { code: "KURIO10", bps: 1000, label: "10% de desconto" },
};

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock("@/api/endpoints", () => ({
  api: {
    quote: mocks.quote,
    listNfts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock("@/lib/cart", () => ({
  useCart: () => ({ data: sampleCart, isLoading: false }),
  useCartMutations: () => ({
    update: { isPending: false, mutate: mocks.updateMutate },
    remove: { isPending: false, mutate: mocks.removeMutate },
  }),
}));

vi.mock("@/lib/session", () => ({
  useSession: () => ({
    user: {
      id: "u-ana",
      email: "ana@kurio.dev",
      username: "ana",
      displayName: "Ana",
      bio: "",
      avatarUrl: "/nft/avatar.svg",
    },
  }),
}));

/** Renderiza a página do carrinho dentro de um QueryClient isolado para cada teste. */
function renderCart() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const CartComponent = Route.options.component!;
  return render(
    <QueryClientProvider client={qc}>
      <CartComponent />
    </QueryClientProvider>,
  );
}

describe("CartPage coupon handling", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.quote.mockReset();
    mocks.navigate.mockReset();
    mocks.quote.mockImplementation(async ({ coupon }: { coupon?: string }) => {
      if (!coupon) return baseQuote;
      if (coupon === "KURIO10") return discountQuote;
      if (coupon === "EXPIRADO50") {
        throw new ApiError(422, "COUPON_EXPIRED", "Este cupom está expirado.");
      }
      throw new ApiError(422, "COUPON_INVALID", "Cupom inválido.");
    });
  });

  it("keeps the quote totals and checkout button enabled when an invalid coupon is applied", async () => {
    renderCart();

    const checkoutBtn = await screen.findByRole("button", { name: "Concluir e finalizar" });
    await waitFor(() => expect(checkoutBtn).not.toBeDisabled());
    expect(screen.getByText("1.24 ETH")).toBeInTheDocument();

    const input = screen.getByLabelText("Código promocional");
    fireEvent.change(input, { target: { value: "INVALIDO" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Cupom inválido.");
    expect(checkoutBtn).not.toBeDisabled();
    expect(screen.getByText("1.24 ETH")).toBeInTheDocument();

    fireEvent.click(checkoutBtn);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/checkout" });
  });

  it("reverts to the base quote and keeps checkout enabled if an expired coupon is entered after a valid one", async () => {
    renderCart();

    const checkoutBtn = await screen.findByRole("button", { name: "Concluir e finalizar" });
    await waitFor(() => expect(checkoutBtn).not.toBeDisabled());

    const input = screen.getByLabelText("Código promocional");
    fireEvent.change(input, { target: { value: "KURIO10" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(await screen.findByText(/KURIO10 — 10% de desconto/)).toBeInTheDocument();
    expect(screen.getByText("1.121 ETH")).toBeInTheDocument();
    expect(checkoutBtn).not.toBeDisabled();

    fireEvent.change(input, { target: { value: "EXPIRADO50" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este cupom está expirado.");
    await waitFor(() => expect(checkoutBtn).not.toBeDisabled());
    expect(screen.getByText("1.24 ETH")).toBeInTheDocument();
  });
});
