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

/** Extrai ou formata o identificador do token com 4 dígitos conforme o Figma (ex.: #0042). */
function formatTokenId(name: string): string {
  const match = name.match(/#(\d+)/);
  if (!match) return "#0001";
  return `#${match[1].padStart(4, "0")}`;
}

/** Carrega itens e cotação, mantendo total fidelidade ao Figma no desktop sem alterar o mobile. */
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
      {/* Cabeçalho mobile com botão de retorno */}
      <div className="mb-5 flex items-center gap-3 md:hidden">
        <Button variant="ghost" size="icon" aria-label="Voltar ao mercado" asChild>
          <Link to="/mercado">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Carrinho</h1>
      </div>

      {/* Trilha de navegação desktop */}
      <nav
        aria-label="Trilha"
        className="mb-6 hidden text-xs font-mono text-muted-foreground/80 md:block"
      >
        <Link to="/" className="hover:text-foreground">
          Início
        </Link>{" "}
        /{" "}
        <Link to="/mercado" className="hover:text-foreground">
          Mercado
        </Link>{" "}
        /{" "}
        <span aria-current="page" className="text-foreground">
          Carrinho
        </span>
      </nav>

      {/* Título semântico para acessibilidade */}
      <h1 className="sr-only">Carrinho de NFTs</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_22rem] lg:grid-cols-[1fr_24rem] md:gap-10 items-start">
        <section aria-label="Itens do carrinho" className="min-w-0">
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
            <div>
              {/* Cabeçalho da grade desktop alinhado perfeitamente ao Figma */}
              <div
                className="hidden md:grid grid-cols-[1fr_6.5rem_8.5rem_7rem_2.5rem] items-center gap-4 pb-2 border-b border-[#3d2c20] text-xs font-mono text-muted-foreground tracking-wider"
                aria-hidden="true"
              >
                <span>NFTs</span>
                <span className="text-left">Preço</span>
                <span className="text-center">Edições</span>
                <span className="text-left">Total</span>
                <span />
              </div>

              {/* Lista móvel (preservada exatamente conforme a versão mobile) */}
              <ul className="space-y-3 md:hidden">
                {items.map((it) => {
                  const limit = Math.min(it.available, it.maxPerOrder);
                  const busy =
                    (update.isPending &&
                      update.variables?.nftId === it.nftId &&
                      update.variables.edition === it.edition) ||
                    (remove.isPending && remove.variables?.nftId === it.nftId);
                  return (
                    <li
                      key={`${it.nftId}-${it.edition}-mobile`}
                      className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 bg-card rounded-xl border border-border/40"
                      aria-busy={busy}
                    >
                      <img
                        src={it.image}
                        alt=""
                        width={96}
                        height={96}
                        className="h-20 w-20 rounded-xl object-cover"
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
                        <p className="text-[11px] text-muted-foreground">Edição {it.edition}</p>
                        {it.notice && (
                          <p
                            role="status"
                            className="mt-1 flex items-center gap-1 text-[11px] text-primary"
                          >
                            <AlertTriangle className="h-3 w-3" aria-hidden /> {it.notice}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-bold text-primary">
                          {formatEth(it.unitPrice)}
                        </p>
                      </div>
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

              {/* Lista desktop com fidelidade total aos cards horizontais do Figma */}
              <ul className="hidden md:block space-y-3 mt-3">
                {items.map((it) => {
                  const limit = Math.min(it.available, it.maxPerOrder);
                  const busy =
                    (update.isPending &&
                      update.variables?.nftId === it.nftId &&
                      update.variables.edition === it.edition) ||
                    (remove.isPending && remove.variables?.nftId === it.nftId);
                  return (
                    <li
                      key={`${it.nftId}-${it.edition}-desktop`}
                      className="grid grid-cols-[1fr_6.5rem_8.5rem_7rem_2.5rem] items-center gap-4 bg-[#19110a] rounded-lg overflow-hidden pr-4 border border-[#2c2017]"
                      aria-busy={busy}
                    >
                      {/* Coluna 1: Imagem + Nome + Token ID */}
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={it.image}
                          alt=""
                          width={80}
                          height={80}
                          className="h-20 w-20 object-cover shrink-0 rounded-l-lg"
                        />
                        <div className="min-w-0 py-2">
                          <Link
                            to="/nft/$id"
                            params={{ id: it.nftId }}
                            search={{ edition: it.edition }}
                            className="block font-mono font-bold text-base text-foreground hover:text-primary truncate"
                          >
                            {it.name}
                          </Link>
                          <p className="text-xs font-mono text-primary mt-1">
                            ID do token: {formatTokenId(it.name)}
                          </p>
                          {it.notice && (
                            <p
                              role="status"
                              className="mt-1 flex items-center gap-1 text-[11px] text-destructive font-mono"
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden /> {it.notice}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Coluna 2: Preço Unitário */}
                      <div className="font-mono font-bold text-base text-foreground">
                        {formatEth(it.unitPrice)}
                      </div>

                      {/* Coluna 3: Edições (QuantityControl) */}
                      <div className="flex items-center justify-center">
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

                      {/* Coluna 4: Total por item */}
                      <div className="font-mono font-bold text-base text-primary">
                        {formatEthSmart(ethMul(it.unitPrice, it.quantity))}
                      </div>

                      {/* Coluna 5: Ícone de exclusão */}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/80 hover:bg-transparent p-1 cursor-pointer"
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
            </div>
          )}
        </section>

        {/* Resumo da carteira: fluido no desktop e fixo no mobile */}
        <aside
          aria-labelledby="summary-title"
          className={cn(
            "h-fit",
            // Mobile: folha fixa no rodapé
            items.length > 0 &&
              "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:max-h-[60vh] max-md:overflow-y-auto max-md:rounded-t-3xl max-md:border-t max-md:border-border max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-md:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] max-md:bg-card max-md:p-5",
            // Desktop: integrado ao canvas sem caixa de cartão
            "md:static md:bg-transparent md:border-0 md:p-0 md:rounded-none md:shadow-none",
          )}
        >
          {/* Cabeçalho do resumo desktop alinhado na mesma altura do cabeçalho da tabela */}
          <div className="hidden md:block pb-2 border-b border-[#3d2c20]">
            <h2
              id="summary-title"
              className="text-sm font-mono font-bold text-foreground tracking-wider"
            >
              Resumo da carteira
            </h2>
          </div>

          <form onSubmit={applyCoupon} noValidate className="mt-4 md:mt-6">
            <label
              htmlFor="coupon"
              className="mb-2 block text-xs font-semibold font-mono text-muted-foreground max-md:sr-only"
            >
              Código promocional
            </label>
            <div className="relative flex items-center md:static">
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
                className="h-10 md:h-11 w-full rounded-full md:rounded-r-none md:rounded-l-md border md:border-r-0 border-border bg-card/80 md:bg-[#19110a] pl-4 md:pl-3.5 pr-24 md:pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                variant="brand"
                className="absolute right-1 md:static h-8 md:h-11 rounded-full md:rounded-l-none md:rounded-r-md px-5 md:px-6 text-xs font-bold font-mono normal-case bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                disabled={!code.trim() || items.length === 0 || applyingCoupon}
              >
                {applyingCoupon ? "Validando…" : "Aplicar"}
              </Button>
            </div>
            {couponFailed ? (
              <p
                id="coupon-err"
                role="alert"
                className="mt-1 text-[11px] text-destructive font-mono"
              >
                {couponErr.message}
              </p>
            ) : (
              <p id="coupon-hint" className="mt-1 text-[11px] text-muted-foreground font-mono">
                Experimente KURIO10.
              </p>
            )}
          </form>

          {q?.coupon && !couponFailed && (
            <p
              className="mt-2 flex items-center justify-between text-xs text-success font-mono"
              role="status"
            >
              {q.coupon.code} — {q.coupon.label}
              <button
                type="button"
                className="text-muted-foreground underline hover:text-foreground"
                onClick={removeCoupon}
              >
                Remover
              </button>
            </p>
          )}

          <dl
            className="mt-6 space-y-3 font-mono text-xs md:text-sm"
            aria-live="polite"
            aria-busy={quote.isFetching}
          >
            {!q && items.length > 0 && !couponFailed ? (
              Array.from({ length: 4 }, (_, i) => <div key={i} className="shimmer h-5 rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-bold text-foreground">
                    {formatEthSmart(q?.subtotal ?? "0")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Desconto de lançamento</dt>
                  <dd className="font-bold text-foreground">
                    {q?.discount && q.discount !== "0"
                      ? `- ${formatEthSmart(q.discount)}`
                      : "- 00.00"}
                  </dd>
                </div>
                <div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Taxa de rede</dt>
                    <dd className="font-bold text-foreground">
                      {formatEthSmart(q?.networkFee ?? "0")}
                    </dd>
                  </div>
                  <p className="text-right text-[10px] text-primary">Taxa estimada</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#3d2c20] pt-4 mt-4">
                  <dt className="text-base font-bold text-foreground">Total</dt>
                  <dd className="text-xl font-bold text-primary">
                    {formatEthSmart(q?.total ?? "0")}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {q?.issues.map((i) => (
            <p
              key={i.nftId + i.edition}
              role="alert"
              className="mt-2 text-xs text-destructive font-mono"
            >
              {i.message}
            </p>
          ))}

          <Button
            variant="brand"
            className="mt-6 h-12 w-full rounded-full md:rounded-md bg-primary font-mono text-sm md:text-base font-bold text-primary-foreground hover:bg-primary/90 normal-case shadow-md transition-transform active:scale-[0.99]"
            disabled={
              !items.length || !q || !!q.issues.length || quote.isFetching || applyingCoupon
            }
            onClick={() => navigate({ to: "/checkout" })}
          >
            {user ? "Concluir e finalizar" : "Conectar e finalizar"}
          </Button>

          <Button
            variant="link"
            className="mt-2 w-full text-xs font-mono text-primary/80 hover:text-primary max-md:hidden"
            asChild
          >
            <Link to="/mercado">Continuar explorando</Link>
          </Button>

          {!user && items.length > 0 && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground font-mono">
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

/** Ajusta a quantidade de uma linha com botões circulares primários conforme o Figma. */
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
      <button
        type="button"
        className="size-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed shrink-0"
        aria-label={`Diminuir quantidade de ${name}`}
        disabled={quantity <= 1 || busy}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus className="size-3.5 stroke-[3]" />
      </button>
      <output className="w-6 text-center font-mono font-bold text-sm text-foreground">
        {quantity}
      </output>
      <button
        type="button"
        className="size-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed shrink-0"
        aria-label={`Aumentar quantidade de ${name}`}
        disabled={quantity >= limit || busy}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus className="size-3.5 stroke-[3]" />
      </button>
    </div>
  );
}
