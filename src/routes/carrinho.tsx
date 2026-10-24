// Rota do carrinho: permite editar itens, aplicar cupom e seguir ao checkout.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useCart, useCartMutations } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { ethMul, formatEth, formatEthSmart } from "@/lib/eth";
import { inputClass } from "@/components/Field";
import { NETWORK_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

import { COUPON_KEY } from "@/lib/checkout-storage";

/** Metadados e componente da rota do carrinho. */
export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho de NFTs — Kurio" },
      {
        name: "description",
        content: "Revise quantidades, aplique cupons e veja o resumo do seu pedido.",
      },
      { property: "og:title", content: "Carrinho — Kurio" },
      { property: "og:description", content: "Seu carrinho de NFTs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

/** Carrega itens e cotação e mantém ações essenciais visíveis no mobile. */
function CartPage() {
  const cart = useCart();
  const { update, remove } = useCartMutations();
  const { user } = useSession();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<string | undefined>(undefined);
  const [code, setCode] = useState("");
  useEffect(() => {
    const c = sessionStorage.getItem(COUPON_KEY) ?? undefined;
    setCoupon(c);
    setCode(c ?? "");
  }, []);
  const items = cart.data?.items ?? [];
  const quote = useQuery({
    queryKey: ["quote", user?.id ?? "guest", coupon ?? "", "ethereum", cart.data?.version],
    queryFn: () => api.quote({ coupon, network: "ethereum" }),
    enabled: !!cart.data && items.length > 0,
    retry: false,
    placeholderData: (p) => p,
  });
  const couponErr = quote.error as ApiError | null;
  const couponFailed =
    couponErr && (couponErr.code === "COUPON_INVALID" || couponErr.code === "COUPON_EXPIRED");

  const applyCoupon = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase() || undefined;
    setCoupon(c);
    if (c) sessionStorage.setItem(COUPON_KEY, c);
    else sessionStorage.removeItem(COUPON_KEY);
  };
  const removeCoupon = () => {
    setCoupon(undefined);
    setCode("");
    sessionStorage.removeItem(COUPON_KEY);
  };
  useEffect(() => {
    if (couponFailed) sessionStorage.removeItem(COUPON_KEY);
  }, [couponFailed]);

  const q = quote.data;
  return (
    <div className={cn("container-page pt-4 md:py-8", items.length > 0 && "pb-[26rem] md:pb-0")}>
      <div className="mb-5 flex items-center gap-3 md:hidden">
        <Button variant="ghost" size="icon" aria-label="Voltar ao mercado" asChild>
          <Link to="/mercado">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Carrinho</h1>
      </div>
      <nav aria-label="Trilha" className="mb-4 hidden text-sm font-semibold md:block">
        <Link to="/">Início</Link> / <Link to="/mercado">Mercado</Link> /{" "}
        <span aria-current="page">Carrinho</span>
      </nav>
      <h1 className="mb-6 hidden text-xl font-bold md:block">Carrinho de NFTs</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Itens do carrinho">
          {!cart.data ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="shimmer h-20 rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg bg-card p-10 text-center">
              <p className="font-semibold">Seu carrinho está vazio</p>
              <Button variant="brand" className="mt-4" asChild>
                <Link to="/mercado">Explorar NFTs</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg bg-card">
              <li
                className="hidden grid-cols-[1fr_6rem_8rem_6rem_2rem] gap-3 px-4 py-2 text-xs text-muted-foreground md:grid"
                aria-hidden
              >
                <span>NFTs</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span />
              </li>
              {items.map((it) => {
                const limit = Math.min(it.available, it.maxPerOrder);
                const busy =
                  (update.isPending &&
                    update.variables?.nftId === it.nftId &&
                    update.variables.edition === it.edition) ||
                  (remove.isPending && remove.variables?.nftId === it.nftId);
                return (
                  <li
                    key={`${it.nftId}-${it.edition}`}
                    className="relative grid grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_6rem_8rem_6rem_2rem] md:items-center md:p-4"
                    aria-busy={busy}
                  >
                    <div className="flex items-center gap-3 md:col-span-1">
                      <img
                        src={it.image}
                        alt=""
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-md object-cover md:h-14 md:w-14"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="pr-7 md:pr-0">
                          <Link
                            to="/nft/$id"
                            params={{ id: it.nftId }}
                            search={{ edition: it.edition }}
                            className="block truncate text-sm font-semibold hover:text-primary"
                          >
                            {it.name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground">
                            Edição {it.edition}
                            <span className="hidden md:inline">
                              {` · ${NETWORK_LABELS[it.network]} · ${it.available} disp.`}
                            </span>
                          </p>
                          {it.notice && (
                            <p
                              role="status"
                              className="mt-1 flex items-center gap-1 text-[11px] text-primary"
                            >
                              <AlertTriangle className="h-3 w-3" aria-hidden /> {it.notice}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 md:hidden">
                          <p className="text-sm font-bold text-primary">
                            {formatEth(it.unitPrice)}
                          </p>
                          <QuantityControl
                            name={it.name}
                            quantity={it.quantity}
                            limit={limit}
                            busy={busy}
                            onChange={(quantity) =>
                              update.mutate({ nftId: it.nftId, edition: it.edition, quantity })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <p className="hidden text-sm md:block">{formatEth(it.unitPrice)}</p>
                    <div className="hidden md:block">
                      <QuantityControl
                        name={it.name}
                        quantity={it.quantity}
                        limit={limit}
                        busy={busy}
                        onChange={(quantity) =>
                          update.mutate({ nftId: it.nftId, edition: it.edition, quantity })
                        }
                      />
                    </div>
                    <p className="hidden text-sm font-bold text-primary md:block">
                      {formatEthSmart(ethMul(it.unitPrice, it.quantity))}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 md:static"
                      aria-label={`Remover ${it.name}`}
                      disabled={busy}
                      onClick={() => remove.mutate({ nftId: it.nftId, edition: it.edition })}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="summary-title"
          className={cn(
            "h-fit rounded-lg bg-card p-5",
            items.length > 0 &&
              "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:max-h-[55vh] max-md:overflow-y-auto max-md:rounded-t-2xl max-md:border max-md:border-border max-md:pb-[max(1rem,env(safe-area-inset-bottom))]",
          )}
        >
          <h2 id="summary-title" className="mb-4 font-bold">
            Resumo da carteira
          </h2>
          <form onSubmit={applyCoupon} noValidate>
            <label htmlFor="coupon" className="mb-1.5 block text-xs font-semibold">
              Código promocional
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código promocional..."
                aria-invalid={!!couponFailed}
                aria-describedby={couponFailed ? "coupon-err" : "coupon-hint"}
                className={inputClass}
              />
              <Button
                variant="brand"
                className="normal-case"
                disabled={!code.trim() || items.length === 0}
              >
                Aplicar
              </Button>
            </div>
            {couponFailed ? (
              <p id="coupon-err" role="alert" className="mt-1 text-[11px] text-destructive">
                {couponErr!.message}
              </p>
            ) : (
              <p id="coupon-hint" className="mt-1 text-[11px] text-muted-foreground">
                Experimente KURIO10.
              </p>
            )}
          </form>
          {q?.coupon && !couponFailed && (
            <p
              className="mt-2 flex items-center justify-between text-xs text-success"
              role="status"
            >
              {q.coupon.code} — {q.coupon.label}
              <button className="text-muted-foreground underline" onClick={removeCoupon}>
                Remover
              </button>
            </p>
          )}
          <dl className="mt-5 space-y-2 text-sm" aria-live="polite" aria-busy={quote.isFetching}>
            {!q && items.length > 0 && !couponFailed ? (
              Array.from({ length: 4 }, (_, i) => <div key={i} className="shimmer h-5 rounded" />)
            ) : (
              <>
                <Row label="Subtotal" value={formatEthSmart(q?.subtotal ?? "0")} />
                <Row
                  label="Desconto de lançamento"
                  value={`- ${formatEthSmart(q?.discount ?? "0")}`}
                />
                <Row label="Taxa de rede" value={formatEthSmart(q?.networkFee ?? "0")} />
                <div className="border-t border-border pt-2">
                  <Row label="Total" value={formatEthSmart(q?.total ?? "0")} strong />
                </div>
              </>
            )}
          </dl>
          {q?.issues.map((i) => (
            <p key={i.nftId + i.edition} role="alert" className="mt-2 text-xs text-destructive">
              {i.message}
            </p>
          ))}
          <Button
            variant="brand"
            className="mt-5 w-full"
            disabled={!items.length || !q || !!q.issues.length || quote.isFetching}
            onClick={() => navigate({ to: "/checkout" })}
          >
            {user ? "Concluir e finalizar" : "Conectar e finalizar"}
          </Button>
          <Button variant="link" className="mt-1 w-full" asChild>
            <Link to="/mercado">Continuar explorando</Link>
          </Button>
          {!user && items.length > 0 && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Você fará login antes do pagamento. Seus itens serão mantidos.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Mostra uma linha do resumo financeiro da cotação. */
/** Ajusta a quantidade de uma linha sem sair do card em telas móveis. */
function QuantityControl({
  name,
  quantity,
  limit,
  busy,
  onChange,
}: {
  name: string;
  quantity: number;
  limit: number;
  busy: boolean;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Quantidade de ${name}`}>
      <Button
        variant="round"
        size="icon"
        className="h-7 w-7"
        aria-label={`Diminuir quantidade de ${name}`}
        disabled={quantity <= 1 || busy}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus />
      </Button>
      <output className="w-5 text-center text-sm">{quantity}</output>
      <Button
        variant="round"
        size="icon"
        className="h-7 w-7"
        aria-label={`Aumentar quantidade de ${name}`}
        disabled={quantity >= limit || busy}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

/** Mostra uma linha do resumo financeiro da cotação. */
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between font-bold" : "flex justify-between"}>
      <dt>{label}</dt>
      <dd className={strong ? "text-primary" : undefined}>{value}</dd>
    </div>
  );
}
