// Rota de pedido: acompanha o pagamento e apresenta o recibo confirmado em modal.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Copy, ExternalLink, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { qk } from "@/api/queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/lib/session";
import { formatEthSmart } from "@/lib/eth";
import { NETWORK_LABELS, shortAddr } from "@/lib/labels";
import { PENDING_ORDER_KEY } from "@/lib/checkout-storage";

/** Metadados e carregamento da rota de pedido autenticada. */
export const Route = createFileRoute("/_authenticated/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Pedido — Kurio" },
      { name: "description", content: "Status e recibo do seu pedido de NFTs." },
      { property: "og:title", content: "Pedido — Kurio" },
      { property: "og:description", content: "Recibo do pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

/** Atualiza pedidos pendentes e congela os dados do recibo confirmado. */
function OrderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  // socket order.updated patches this cache; polling is the fallback while pending
  const q = useQuery({
    queryKey: qk.order(user!.id, id),
    queryFn: () => api.order(id),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 3000 : false),
  });
  const o = q.data;
  useEffect(() => {
    if (o && o.status !== "pending" && localStorage.getItem(PENDING_ORDER_KEY) === o.id)
      localStorage.removeItem(PENDING_ORDER_KEY);
  }, [o]);

  if (q.isError) {
    const e = q.error as ApiError;
    return (
      <section className="container-page py-16 text-center">
        <h1 className="text-xl font-bold">
          {e.status === 404 || e.status === 403
            ? "Pedido não encontrado"
            : "Não foi possível carregar o pedido"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{e.message}</p>
        {e.status !== 404 && e.status !== 403 && (
          <Button variant="brand" className="mt-4" onClick={() => q.refetch()}>
            Tentar novamente
          </Button>
        )}
      </section>
    );
  }
  if (!o)
    return (
      <div className="container-page py-10">
        <div className="shimmer mx-auto h-96 max-w-xl rounded-lg" />
      </div>
    );

  if (o.status === "pending")
    return (
      <section
        className="container-page grid min-h-[50vh] place-items-center py-16 text-center"
        aria-live="polite"
      >
        <div>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden />
          <h1 className="mt-4 text-xl font-bold">Aguardando confirmação da rede…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pedido {o.id}. Você pode recarregar ou sair desta página — o status será recuperado.
          </p>
        </div>
      </section>
    );

  if (o.status === "declined")
    return (
      <section
        className="container-page grid min-h-[50vh] place-items-center py-16 text-center"
        role="alert"
      >
        <div>
          <XCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden />
          <h1 className="mt-4 text-xl font-bold">Pagamento recusado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {o.declineReason}. Nenhum valor foi cobrado e seus itens continuam no carrinho.
          </p>
          <Button variant="brand" className="mt-6" asChild>
            <Link to="/carrinho">Voltar ao carrinho</Link>
          </Button>
        </div>
      </section>
    );

  // receipt renders the order snapshot only; later catalog changes never alter it
  return (
    <Dialog open onOpenChange={(open) => !open && navigate({ to: "/" })}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-b-4 border-primary bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Pedido confirmado</DialogTitle>
        </DialogHeader>
        <img src="/nft/message.svg" alt="" width={40} height={40} className="mx-auto" />
        <h1 id="receipt-title" className="mt-3 text-center text-sm font-bold">
          Seus NFTs agora estão na sua carteira
        </h1>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
          <Meta label="ID da transação" value={o.txHash ? shortAddr(o.txHash) : "—"} />
          <Meta
            label="Data"
            value={new Date(o.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
          <Meta label="Total" value={formatEthSmart(o.total)} />
          <Meta
            label="Carteira e rede"
            value={`${o.wallet.label} · ${NETWORK_LABELS[o.network]}`}
          />
        </dl>
        <h2 className="mt-6 text-xs font-bold">Detalhes da transação</h2>
        <table className="mt-2 w-full text-xs">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-1 font-normal">NFTs</th>
              <th className="py-1 font-normal">Edições</th>
              <th className="py-1 text-right font-normal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {o.lines.map((l) => (
              <tr key={l.nftId + l.edition} className="border-t border-border">
                <td className="py-2">
                  <span className="flex items-center gap-2">
                    <img
                      src={l.image}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded object-cover"
                    />
                    {l.name}
                  </span>
                </td>
                <td className="py-2">
                  {l.edition} × {l.quantity}
                </td>
                <td className="py-2 text-right font-bold text-primary">
                  {formatEthSmart(l.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 space-y-1 border-t border-border pt-3 text-xs">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatEthSmart(o.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Desconto{o.coupon ? ` (${o.coupon})` : ""}</dt>
            <dd>- {formatEthSmart(o.discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Taxa de rede</dt>
            <dd>{formatEthSmart(o.networkFee)}</dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Total</dt>
            <dd className="text-primary">{formatEthSmart(o.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Transação confirmada (simulação). A propriedade foi transferida para sua carteira
          conectada.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {o.txHash && (
            <Button
              variant="line"
              size="sm"
              onClick={() =>
                navigator.clipboard
                  .writeText(o.txHash!)
                  .then(() => toast.success("ID da transação copiado"))
              }
            >
              <Copy /> Copiar ID
            </Button>
          )}
          {o.explorerUrl && (
            <Button variant="brand" size="sm" asChild>
              <a href={o.explorerUrl} target="_blank" rel="noreferrer noopener">
                Ver no Etherscan (simulado) <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Exibe um metadado curto do pedido confirmado. */
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}
