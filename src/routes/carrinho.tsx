// Rota do carrinho: permite editar itens, aplicar cupom e seguir ao checkout.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { api } from "@/api/endpoints";
import { toApiError, type ApiError } from "@/api/client";
import { nftListQuery } from "@/api/queries";
import { Button } from "@/components/ui/button";
import { TrashFigmaIcon } from "@/components/icons/TrashFigmaIcon";
import { NftCard } from "@/components/nft/NftCard";
import { useCart, useCartMutations } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { ethMul, formatEth, formatEthSmart } from "@/lib/eth";
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
  const qc = useQueryClient();
  const cart = useCart();
  const { update, remove } = useCartMutations();
  const { user } = useSession();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<string | undefined>(undefined);
  const [code, setCode] = useState("");
  const [couponErr, setCouponErr] = useState<ApiError | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem(COUPON_KEY) ?? undefined;
    setCoupon(c);
    setCode(c ?? "");
  }, []);

  const items = cart.data?.items ?? [];
  const uid = user?.id ?? "guest";
  const quote = useQuery({
    queryKey: ["quote", uid, coupon ?? "", "ethereum", cart.data?.version],
    queryFn: () => api.quote({ coupon, network: "ethereum" }),
    enabled: !!cart.data && items.length > 0,
    retry: false,
    staleTime: 5_000,
    placeholderData: (p) => p,
  });

  const suggestions = useQuery(nftListQuery({ page: 1, pageSize: 12 }));
  const cartIds = items.map((i) => i.nftId);
  const suggestedItems =
    suggestions.data?.items.filter((nft) => !cartIds.includes(nft.id)).slice(0, 5) ?? [];

  // Se um cupom salvo anteriormente na sessão falhar ao abrir o carrinho, preserva o erro e volta à cotação sem cupom.
  useEffect(() => {
    const qErr = quote.error as ApiError | null;
    if (qErr && (qErr.code === "COUPON_INVALID" || qErr.code === "COUPON_EXPIRED")) {
      setCouponErr(qErr);
      setCoupon(undefined);
      sessionStorage.removeItem(COUPON_KEY);
    }
  }, [quote.error]);

  const couponFailed =
    couponErr && (couponErr.code === "COUPON_INVALID" || couponErr.code === "COUPON_EXPIRED");

  const removeCoupon = () => {
    setCoupon(undefined);
    setCode("");
    setCouponErr(null);
    sessionStorage.removeItem(COUPON_KEY);
  };

  // Valida o cupom antes de fixá-lo na query principal para nunca zerar a cotação nem travar o botão de checkout.
  const applyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) {
      removeCoupon();
      return;
    }
    setApplyingCoupon(true);
    setCouponErr(null);
    try {
      const res = await api.quote({ coupon: c, network: "ethereum" });
      qc.setQueryData(["quote", uid, c, "ethereum", cart.data?.version], res);
      setCoupon(c);
      sessionStorage.setItem(COUPON_KEY, c);
    } catch (err) {
      setCouponErr(toApiError(err));
      setCoupon(undefined);
      sessionStorage.removeItem(COUPON_KEY);
    } finally {
      setApplyingCoupon(false);
    }
  };

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
              <p className="font-semibold text-muted-foreground">Seu carrinho está vazio</p>
              <Button variant="explore" className="mt-4" asChild>
                <Link to="/" hash="catalogo" aria-label="Explorar NFTs">
                  Explorar <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
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
                    className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 md:grid-cols-[1fr_6rem_8rem_6rem_2rem] md:p-4"
                    aria-busy={busy}
                  >
                    <img
                      src={it.image}
                      alt=""
                      width={96}
                      height={96}
                      className="h-20 w-20 rounded-xl object-cover md:h-14 md:w-14"
                    />
                    <div className="min-w-0 pr-2">
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
                      <p className="mt-1 text-sm font-bold text-primary md:hidden">
                        {formatEth(it.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:contents">
                      <p className="hidden text-sm md:block">{formatEth(it.unitPrice)}</p>
                      <div className="flex items-center gap-2">
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
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        aria-label={`Remover ${it.name}`}
                        disabled={busy}
                        onClick={() => remove.mutate({ nftId: it.nftId, edition: it.edition })}
                      >
                        <TrashFigmaIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="summary-title"
          className={cn(
            "h-fit rounded-2xl bg-card p-5 border border-border/50",
            items.length > 0 &&
              "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:max-h-[60vh] max-md:overflow-y-auto max-md:rounded-t-3xl max-md:border-t max-md:border-border max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-md:shadow-[0_-8px_30px_rgba(0,0,0,0.6)]",
          )}
        >
          <h2 id="summary-title" className="mb-4 text-sm font-bold max-md:hidden">
            Resumo da carteira
          </h2>
          <form onSubmit={applyCoupon} noValidate>
            <label htmlFor="coupon" className="mb-1.5 block text-xs font-semibold max-md:sr-only">
              Código promocional
            </label>
            <div className="relative flex items-center">
              <input
                id="coupon"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (couponErr) setCouponErr(null);
                }}
                placeholder="Digite o código promocional..."
                aria-invalid={!!couponFailed}
                aria-describedby={couponFailed ? "coupon-err" : "coupon-hint"}
                className="h-10 w-full rounded-full border border-border bg-card/80 pl-4 pr-24 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                variant="brand"
                className="absolute right-1 h-8 rounded-full px-5 text-xs font-semibold normal-case bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!code.trim() || items.length === 0 || applyingCoupon}
              >
                {applyingCoupon ? "Validando…" : "Aplicar"}
              </Button>
            </div>
            {couponFailed ? (
              <p id="coupon-err" role="alert" className="mt-1 text-[11px] text-destructive">
                {couponErr.message}
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
              <button
                type="button"
                className="text-muted-foreground underline"
                onClick={removeCoupon}
              >
                Remover
              </button>
            </p>
          )}
          <dl
            className="mt-4 space-y-2.5 text-xs md:text-sm"
            aria-live="polite"
            aria-busy={quote.isFetching}
          >
            {!q && items.length > 0 && !couponFailed ? (
              Array.from({ length: 4 }, (_, i) => <div key={i} className="shimmer h-5 rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatEthSmart(q?.subtotal ?? "0")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Desconto de lançamento</dt>
                  <dd className="font-medium">
                    {q?.discount && q.discount !== "0"
                      ? `(-) ${formatEthSmart(q.discount)}`
                      : "(-) 00.00"}
                  </dd>
                </div>
                <div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Taxa de rede</dt>
                    <dd className="font-medium">{formatEthSmart(q?.networkFee ?? "0")}</dd>
                  </div>
                  <p className="text-right text-[10px] text-primary">Taxa estimada</p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="text-base font-bold">Total</dt>
                  <dd className="text-base font-bold text-primary">
                    {formatEthSmart(q?.total ?? "0")}
                  </dd>
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
            className="mt-6 h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90 shadow-md"
            disabled={
              !items.length || !q || !!q.issues.length || quote.isFetching || applyingCoupon
            }
            onClick={() => navigate({ to: "/checkout" })}
          >
            {user ? "Concluir e finalizar" : "Conectar e finalizar"}
          </Button>
          <Button
            variant="link"
            className="mt-1 w-full text-xs text-muted-foreground hover:text-primary max-md:hidden"
            asChild
          >
            <Link to="/mercado">Continuar explorando</Link>
          </Button>
          {!user && items.length > 0 && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Você fará login antes do pagamento. Seus itens serão mantidos.
            </p>
          )}
        </aside>
      </div>

      {suggestedItems.length > 0 && (
        <section aria-labelledby="also-viewed-title" className="mt-16 md:mt-24">
          <h2
            id="also-viewed-title"
            className="border-b border-border pb-2 text-sm font-bold font-mono text-primary"
          >
            Colecionadores também viram
          </h2>
          <ul
            aria-label="Colecionadores também viram"
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          >
            {suggestedItems.map((nft) => (
              <li key={nft.id}>
                <NftCard nft={nft} />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center gap-2" aria-hidden="true">
            <span className="size-2 rounded-full border border-primary/60 bg-transparent" />
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full border border-primary/60 bg-transparent" />
          </div>
        </section>
      )}
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
