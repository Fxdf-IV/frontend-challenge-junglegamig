// Testes da rota do carrinho: garante que cupons inválidos ou expirados exibem erro sem travar o botão de checkout.
import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import type { Cart, Quote } from "@/api/types";
import { buildNfts } from "@/mocks/fixtures";
import { Route } from "@/routes/carrinho";

const mocks = vi.hoisted(() => {
  const initialCart: import("@/api/types").Cart = {
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
  return {
    quote: vi.fn(),
    navigate: vi.fn(),
    updateMutate: vi.fn(),
    removeMutate: vi.fn(),
    listNfts: vi.fn(),
    cart: initialCart,
  };
});

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

const mockSuggestedNfts = buildNfts().slice(0, 15);

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
    listNfts: mocks.listNfts,
    favorites: vi.fn().mockResolvedValue({ ids: [] }),
  },
}));

vi.mock("@/lib/cart", () => ({
  useCart: () => ({ data: mocks.cart, isLoading: false }),
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
    defaultOptions: { queries: { retry: false, queryFn: () => [] } },
  });
  qc.setQueryData(["u", "u-ana", "favorites"], []);
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
    mocks.cart = sampleCart;
    mocks.quote.mockReset();
    mocks.navigate.mockReset();
    mocks.listNfts.mockReset();
    mocks.listNfts.mockResolvedValue({ items: mockSuggestedNfts, total: 15 });
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

  it("renders collectors also viewed carousel with navigation arrows and pagination tabs", async () => {
    renderCart();

    expect(
      await screen.findByRole("heading", { name: "Colecionadores também viram" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Slide anterior de recomendações")).toBeInTheDocument();
    expect(screen.getByLabelText("Próximo slide de recomendações")).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");

    fireEvent.click(tabs[1]);
  });

  it("resets total, subtotal and network fee to 0.00 ETH and disables checkout when cart has no items", async () => {
    // Simula o carrinho esvaziado pelo usuário
    mocks.cart = { id: "cart-u-ana", version: 2, items: [] };
    renderCart();

    expect(screen.getByText("Seu carrinho está vazio")).toBeInTheDocument();
    // Subtotal, Taxa de rede e Total devem zerar em 0.00 ETH
    const zeroValues = screen.getAllByText("0.00 ETH");
    expect(zeroValues.length).toBeGreaterThanOrEqual(3);
    const checkoutBtn = screen.getByRole("button", { name: "Concluir e finalizar" });
    expect(checkoutBtn).toBeDisabled();
  });
});
