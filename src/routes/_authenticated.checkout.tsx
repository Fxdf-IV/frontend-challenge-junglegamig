// Checkout: valida colecionador, carteira e cotação antes de criar o pedido.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Check, Plug, Unplug } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import { toApiError, type ApiError } from "@/api/client";
import type { Network, Quote } from "@/api/types";
import { qk } from "@/api/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FormError, inputClass } from "@/components/Field";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { formatEthSmart } from "@/lib/eth";
import { NETWORK_LABELS, PROVIDER_LABELS, shortAddr } from "@/lib/labels";
import { COUPON_KEY, DRAFT_KEY, idemKey, PENDING_ORDER_KEY } from "@/lib/checkout-storage";
import { cn } from "@/lib/utils";

/** Metadados e montagem da rota privada de pagamento. */
export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Pagamento — Kurio" },
      {
        name: "description",
        content: "Dados do colecionador, carteira, rede e revisão do pedido.",
      },
      { property: "og:title", content: "Pagamento — Kurio" },
      { property: "og:description", content: "Finalize sua compra de NFTs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Conn = "idle" | "connecting" | "connected" | "refused";

/** Conduz o pedido e mantém a ação de revisão acessível no mobile. */
function Checkout() {
  const { user } = useSession();
  const uid = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const cart = useCart();
  const wallets = useQuery({
    queryKey: qk.wallets(uid),
    queryFn: api.wallets,
    select: (d) => d.items,
  });
  const [draft, setDraft] = useState(() => {
    const base = {
      name: user!.displayName,
      email: user!.email,
      note: "",
      walletId: "",
      network: "ethereum" as Network,
    };
    if (typeof window === "undefined") return base;
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return base;
    try {
      return { ...base, ...(JSON.parse(raw) as Partial<typeof base>) };
    } catch {
      return base;
    }
  });
  const [coupon, setCoupon] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conn, setConn] = useState<Conn>("idle");
  const [prompt, setPrompt] = useState(false);
  const [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<ApiError | null>(null);
  const [changed, setChanged] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const inflight = useRef(false);
  const connectBtnRef = useRef<HTMLButtonElement>(null);
  const reviewBtnRef = useRef<HTMLButtonElement>(null);

  // Restaura cupom e pedido pendente na montagem; o rascunho já inicia do sessionStorage
  // para que o StrictMode não sobrescreva o storage com estado vazio no primeiro efeito.
  useEffect(() => {
    setCoupon(sessionStorage.getItem(COUPON_KEY) ?? undefined);
    setPending(localStorage.getItem(PENDING_ORDER_KEY));
  }, []);
  useEffect(() => sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)), [draft]);
  useEffect(() => {
    if (!draft.walletId && wallets.data?.length) {
      const primary = wallets.data.find((w) => w.role === "primary") ?? wallets.data[0];
      setDraft((d) => ({ ...d, walletId: primary.id, network: primary.network }));
    }
  }, [wallets.data, draft.walletId]);

  const quoteKey = ["quote", uid, coupon ?? "", draft.network, cart.data?.version] as const;
  const quote = useQuery({
    queryKey: quoteKey,
    queryFn: () => api.quote({ coupon, network: draft.network }),
    enabled: !!cart.data?.items.length,
    retry: false,
    placeholderData: (p) => p,
  });
  const q = quote.data;
  const wallet = wallets.data?.find((w) => w.id === draft.walletId);

  // a quote change while reviewing requires a new confirmation
  const lastQuoteId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastQuoteId.current && q && q.id !== lastQuoteId.current && review) {
      setChanged(
        "Preço, disponibilidade ou taxas mudaram. Revise os novos valores antes de confirmar.",
      );
    }
    lastQuoteId.current = q?.id;
  }, [q, review]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 2) e.name = "Informe o nome do colecionador";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email)) e.email = "Informe um e-mail válido";
    if (!wallet) e.walletId = "Selecione uma carteira cadastrada";
    else if (conn !== "connected") e.walletId = "Conecte a carteira para continuar";
    if (draft.note.length > 200) e.note = "Máximo de 200 caracteres";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openReview = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Verifique os campos destacados");
      return;
    }
    setChanged(null);
    setSubmitErr(null);
    setReview(true);
  };

  const confirm = async () => {
    if (!q || inflight.current) return; // prevents duplicate submissions
    inflight.current = true;
    setSubmitting(true);
    setSubmitErr(null);
    // same attempt => same key (survives retries after timeout and refresh)
    let key = sessionStorage.getItem(idemKey(q.id));
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem(idemKey(q.id), key);
    }
    try {
      const order = await api.createOrder(key, {
        quoteId: q.id,
        walletId: draft.walletId,
        network: draft.network,
        coupon,
        collector: {
          name: draft.name.trim(),
          email: draft.email.trim(),
          note: draft.note.trim() || undefined,
        },
      });
      localStorage.setItem(PENDING_ORDER_KEY, order.id);
      qc.setQueryData(qk.order(uid, order.id), order);
      sessionStorage.removeItem(DRAFT_KEY);
      setReview(false);
      navigate({ to: "/pedido/$id", params: { id: order.id } });
    } catch (e) {
      const err = toApiError(e);
      if (err.code === "QUOTE_STALE" || err.code === "AVAILABILITY") {
        if (err.body?.quote) qc.setQueryData<Quote>(quoteKey, err.body.quote);
        qc.invalidateQueries({ queryKey: ["cart"] });
        setChanged(err.message);
      } else if (err.code === "VALIDATION") {
        setErrors(err.fields ?? {});
        setReview(false);
        toast.error(err.message);
      } else setSubmitErr(err);
    } finally {
      inflight.current = false;
      setSubmitting(false);
    }
  };

  if (cart.data && !cart.data.items.length && !pending)
    return (
      <div className="container-page py-16 text-center">
        <p className="font-semibold">Seu carrinho está vazio.</p>
        <Button variant="brand" className="mt-4" asChild>
          <Link to="/mercado">Explorar NFTs</Link>
        </Button>
      </div>
    );

  return (
    <div className="container-page pb-28 pt-4 md:py-8">
      <div className="mb-4 flex items-center gap-3 md:hidden">
        <Button variant="ghost" size="icon" aria-label="Voltar ao carrinho" asChild>
          <Link to="/carrinho">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Pagamento</h1>
      </div>
      <nav aria-label="Trilha" className="mb-4 hidden text-sm font-semibold md:block">
        <Link to="/">Início</Link> / <Link to="/carrinho">Carrinho</Link> /{" "}
        <span aria-current="page">Pagamento</span>
      </nav>
      {pending && (
        <p role="status" className="mb-4 rounded-md bg-panel px-4 py-3 text-sm">
          Você tem um pedido em processamento.{" "}
          <Link
            to="/pedido/$id"
            params={{ id: pending }}
            className="font-semibold text-primary underline"
          >
            Acompanhar pedido
          </Link>
        </p>
      )}
      <form onSubmit={openReview} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="collector-title" className="space-y-6">
          <div className="rounded-lg bg-card p-5">
            <h1 id="collector-title" className="mb-4 font-bold">
              Perfil do colecionador
            </h1>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome de exibição *"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="E-mail *"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <div className="sm:col-span-2">
                <label htmlFor="note" className="mb-1.5 block text-xs font-semibold">
                  Observação do colecionador (opcional)
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  aria-invalid={!!errors.note}
                  aria-describedby={errors.note ? "note-err" : undefined}
                  className={cn(inputClass, "h-auto py-2")}
                />
                {errors.note && (
                  <p id="note-err" className="mt-1 text-[11px] text-destructive">
                    {errors.note}
                  </p>
                )}
              </div>
            </div>
          </div>

          <fieldset
            className="rounded-lg bg-card p-5"
            aria-describedby={errors.walletId ? "wallet-err" : undefined}
          >
            <legend className="sr-only">Carteira e rede</legend>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Carteira conectada</h2>
              <Link
                to="/carteiras"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Gerenciar carteiras
              </Link>
            </div>
            {wallets.isLoading ? (
              <div className="shimmer h-16 rounded" />
            ) : !wallets.data?.length ? (
              <p className="text-sm">
                Nenhuma carteira cadastrada.{" "}
                <Link to="/carteiras" className="font-semibold text-primary underline">
                  Cadastrar carteira
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {wallets.data.map((w) => (
                  <li key={w.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3",
                        draft.walletId === w.id ? "border-primary" : "border-border",
                      )}
                    >
                      <input
                        type="radio"
                        name="wallet"
                        className="accent-primary"
                        checked={draft.walletId === w.id}
                        onChange={() => {
                          setDraft({ ...draft, walletId: w.id, network: w.network });
                          setConn("idle");
                        }}
                      />
                      <span className="flex-1 text-sm">
                        <span className="font-semibold">{w.label}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({w.role === "primary" ? "principal" : "secundária"})
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {PROVIDER_LABELS[w.provider]} · {shortAddr(w.address)}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="network" className="mb-1.5 block text-xs font-semibold">
                  Rede
                </label>
                <select
                  id="network"
                  value={draft.network}
                  onChange={(e) => setDraft({ ...draft, network: e.target.value as Network })}
                  className={inputClass}
                >
                  {(Object.keys(NETWORK_LABELS) as Network[]).map((n) => (
                    <option key={n} value={n}>
                      {NETWORK_LABELS[n]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                {conn === "connected" ? (
                  <>
                    <p
                      className="flex h-10 flex-1 items-center gap-2 text-sm text-success"
                      role="status"
                    >
                      <Check className="h-4 w-4" /> Conectada
                    </p>
                    <Button
                      type="button"
                      variant="line"
                      onClick={() => {
                        setConn("idle");
                        toast.info("Carteira desconectada");
                      }}
                    >
                      <Unplug /> Desconectar
                    </Button>
                  </>
                ) : (
                  <Button
                    ref={connectBtnRef}
                    type="button"
                    variant="line"
                    className="w-full"
                    disabled={!wallet || conn === "connecting"}
                    onClick={() => {
                      setConn("connecting");
                      setPrompt(true);
                    }}
                  >
                    <Plug /> {conn === "connecting" ? "Aguardando carteira…" : "Conectar carteira"}
                  </Button>
                )}
              </div>
            </div>
            {conn === "refused" && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                A conexão foi recusada na carteira. Tente novamente.
              </p>
            )}
            {errors.walletId && (
              <p id="wallet-err" role="alert" className="mt-2 text-xs text-destructive">
                {errors.walletId}
              </p>
            )}
          </fieldset>
        </section>

        <aside aria-labelledby="order-summary" className="h-fit rounded-lg bg-card p-5">
          <h2 id="order-summary" className="mb-4 font-bold">
            Seus NFTs
          </h2>
          {!q ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="shimmer h-10 rounded" />
              ))}
            </div>
          ) : (
            <Summary q={q} />
          )}
          {quote.error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {(quote.error as Error).message}
            </p>
          )}
          {q?.issues.map((i) => (
            <p key={i.nftId + i.edition} role="alert" className="mt-2 text-xs text-destructive">
              {i.message} —{" "}
              <Link to="/carrinho" className="underline">
                ajustar carrinho
              </Link>
            </p>
          ))}
          <Button
            ref={reviewBtnRef}
            variant="brand"
            className="mt-5 w-full max-md:fixed max-md:inset-x-4 max-md:bottom-4 max-md:z-40 max-md:mt-0 max-md:w-[calc(100%-2rem)]"
            disabled={!q || !!q.issues.length || quote.isFetching}
          >
            Revisar pedido
          </Button>
        </aside>
      </form>

      <Dialog
        open={prompt}
        onOpenChange={(o) => {
          if (!o) {
            setPrompt(false);
            if (conn === "connecting") setConn("idle");
          }
        }}
      >
        <DialogContent
          onCloseAutoFocus={(e) => {
            // O botão fica desabilitado enquanto `conn === "connecting"`, perdendo o foco ativo;
            // devolvemos o foco explicitamente ao gatilho quando o modal controlado fecha sem aprovar.
            if (connectBtnRef.current) {
              e.preventDefault();
              connectBtnRef.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {wallet ? PROVIDER_LABELS[wallet.provider] : "Carteira"} (simulação)
            </DialogTitle>
            <DialogDescription>
              Kurio solicita acesso à conta {wallet && shortAddr(wallet.address)} na rede{" "}
              {NETWORK_LABELS[draft.network]}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="line"
              onClick={() => {
                setConn("refused");
                setPrompt(false);
              }}
            >
              Recusar
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                setConn("connected");
                setPrompt(false);
                setErrors((e) => ({ ...e, walletId: "" }));
                toast.success("Carteira conectada");
              }}
            >
              Aprovar conexão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={review} onOpenChange={(o) => !submitting && setReview(o)}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onCloseAutoFocus={(e) => {
            // Restaura o foco ao botão "Revisar pedido" ao fechar o diálogo controlado de revisão.
            if (reviewBtnRef.current) {
              e.preventDefault();
              reviewBtnRef.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Revise seu pedido</DialogTitle>
            <DialogDescription>
              Os valores abaixo são a cotação atual. A compra só é concluída após a confirmação da
              rede.
            </DialogDescription>
          </DialogHeader>
          {changed && (
            <p
              role="alert"
              className="flex gap-2 rounded-md border border-primary/60 bg-primary/10 p-3 text-xs"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-primary" /> {changed}
            </p>
          )}
          {q && <Summary q={q} />}
          <dl className="space-y-1 text-xs text-muted-foreground">
            <div>
              <dt className="inline">Colecionador: </dt>
              <dd className="inline">
                {draft.name} · {draft.email}
              </dd>
            </div>
            <div>
              <dt className="inline">Carteira: </dt>
              <dd className="inline">
                {wallet?.label} · {wallet && shortAddr(wallet.address)} ·{" "}
                {NETWORK_LABELS[draft.network]}
              </dd>
            </div>
          </dl>
          {submitErr && (
            <FormError
              message={
                submitErr.code === "TIMEOUT" || submitErr.code === "NETWORK"
                  ? "Não recebemos resposta do servidor. Tentar novamente não criará outro pedido."
                  : submitErr.message
              }
            />
          )}
          <DialogFooter>
            <Button variant="line" disabled={submitting} onClick={() => setReview(false)}>
              Voltar
            </Button>
            <Button
              variant="brand"
              disabled={submitting || !q || !!q.issues.length}
              onClick={() => {
                setChanged(null);
                confirm();
              }}
            >
              {submitting
                ? "Enviando…"
                : changed
                  ? "Confirmar novos valores"
                  : submitErr
                    ? "Tentar novamente"
                    : "Confirmar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Resume itens, desconto, taxa e total da cotação atual. */
function Summary({ q }: { q: Quote }) {
  return (
    <div>
      <ul className="space-y-3">
        {q.lines.map((l) => (
          <li key={l.nftId + l.edition} className="flex items-center gap-3 text-xs">
            <img
              src={l.image}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{l.name}</span>
              <span className="text-muted-foreground">
                {l.edition} · {l.quantity} × {formatEthSmart(l.unitPrice)}
              </span>
            </span>
            <span className="font-bold text-primary">{formatEthSmart(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm" aria-live="polite">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatEthSmart(q.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto{q.coupon ? ` (${q.coupon.code})` : ""}</dt>
          <dd>- {formatEthSmart(q.discount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Taxa de rede</dt>
          <dd>{formatEthSmart(q.networkFee)}</dd>
        </div>
        <div className="flex justify-between font-bold">
          <dt>Total</dt>
          <dd className="text-primary">{formatEthSmart(q.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
