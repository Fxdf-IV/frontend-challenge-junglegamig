// Rota de pedido: acompanha o pagamento e apresenta o recibo confirmado em modal.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Copy, ExternalLink, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { qk } from "@/api/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/session";
import { formatEthSmart } from "@/lib/eth";
import { shortAddr } from "@/lib/labels";
import { PENDING_ORDER_KEY } from "@/lib/checkout-storage";
import { cn } from "@/lib/utils";

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
  const qc = useQueryClient();
  const { user } = useSession();
  // socket order.updated patches this cache; polling is the fallback while pending
  const q = useQuery({
    queryKey: qk.order(user!.id, id),
    queryFn: () => api.order(id),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 3000 : false),
  });
  const o = q.data;
  // Quando o pedido sai de pendente (via Socket.IO ou polling), limpa a pendência local e reconcilia o carrinho.
  useEffect(() => {
    if (o && o.status !== "pending") {
      if (localStorage.getItem(PENDING_ORDER_KEY) === o.id) {
        localStorage.removeItem(PENDING_ORDER_KEY);
      }
      if (o.status === "confirmed") {
        qc.invalidateQueries({ queryKey: ["cart"] });
        qc.invalidateQueries({ queryKey: ["quote"] });
      }
    }
  }, [o, qc]);

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

  // Renderiza o recibo da compra confirmada com o layout alinhado ao Figma (envelope 'THANK YOU',
  // tabela de detalhes com edições centralizadas, totais deslocados à direita e botões de ação).
  return (
    <Dialog open onOpenChange={(open) => !open && navigate({ to: "/" })}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-2xl border border-border/80 border-b-[8px] border-b-primary bg-[#241612] p-5 shadow-2xl sm:p-7 [&>button]:text-primary [&>button]:opacity-100 [&>button]:hover:text-primary/80">
        <DialogHeader className="sr-only">
          <DialogTitle>Pedido confirmado</DialogTitle>
          <DialogDescription>
            Recibo da transação confirmada com resumo dos NFTs e valores pagos.
          </DialogDescription>
        </DialogHeader>

        {/* Ícone de envelope com carta 'THANK YOU' idêntico ao Figma */}
        <div className="pt-2 text-center">
          <img
            src="/nft/thank-you.png"
            alt=""
            width={66}
            height={80}
            className="mx-auto h-20 w-auto"
          />
        </div>

        {/* Título de sucesso */}
        <h1
          id="receipt-title"
          className="mt-2 text-center text-base font-bold text-foreground sm:text-lg"
        >
          Seus NFTs agora estão na sua carteira
        </h1>

        {/* Grade de 4 colunas de metadados delimitada por bordas laranjas (Figma) */}
        <dl className="mt-5 grid grid-cols-2 gap-y-3 border-y border-primary py-3 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
          <Meta label="ID da transação" value={o.txHash ? shortAddr(o.txHash) : "—"} />
          <Meta
            label="Data"
            value={new Date(o.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
          <Meta label="Total" value={formatEthSmart(o.total)} isPrimary />
          <Meta label="Carteira" value={o.wallet.label} />
        </dl>

        {/* Cabeçalho da seção de detalhes da transação */}
        <div className="mt-5">
          <h2 className="text-sm font-bold text-foreground">Detalhes da transação</h2>
        </div>

        {/* Tabela de itens adquiridos com thumbnail ampliado, edições entre parênteses e subtotal */}
        <div className="mt-2 w-full overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="pb-2 text-left font-normal">NFTs</th>
                <th className="w-24 pb-2 text-center font-normal">Edições</th>
                <th className="w-28 pb-2 text-right font-normal">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {o.lines.map((l) => (
                <tr key={l.nftId + l.edition}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={l.image}
                        alt=""
                        width={56}
                        height={56}
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-foreground sm:text-sm">
                          {l.name}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          ID do token: #{String(l.edition).padStart(4, "0")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center font-mono text-xs text-muted-foreground">
                    (× {l.quantity})
                  </td>
                  <td className="py-3 text-right font-mono text-xs font-bold text-primary sm:text-sm">
                    {formatEthSmart(l.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bloco de totais alinhado à direita conforme Comentário #51 do Figma */}
        <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
          <dl className="w-full max-w-xs space-y-1.5 font-mono text-xs">
            {o.subtotal !== o.total && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-medium text-foreground">{formatEthSmart(o.subtotal)}</dd>
              </div>
            )}
            {o.coupon && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Desconto ({o.coupon})</dt>
                <dd className="font-medium text-primary">- {formatEthSmart(o.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Taxa de rede</dt>
              <dd className="font-medium text-foreground">{formatEthSmart(o.networkFee)}</dd>
            </div>
            <div className="flex justify-between pt-1 font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="text-base text-primary">{formatEthSmart(o.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Nota de confirmação centralizada */}
        <p className="mt-3 border-t border-border/60 pt-4 text-center font-mono text-xs leading-relaxed text-muted-foreground">
          Transação confirmada (simulação). A propriedade foi transferida para sua carteira
          conectada.
        </p>

        {/* Botões de ação: 'Copiar ID' preservado conforme pedido do usuário e 'Ver no Etherscan' */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {o.txHash && (
            <Button
              variant="line"
              size="default"
              onClick={() =>
                navigator.clipboard
                  .writeText(o.txHash!)
                  .then(() => toast.success("ID da transação copiado"))
              }
            >
              <Copy className="mr-1.5 size-4" /> Copiar ID
            </Button>
          )}
          {o.explorerUrl && (
            <Button variant="brand" size="default" asChild>
              <a href={o.explorerUrl} target="_blank" rel="noreferrer noopener">
                Ver no Etherscan (simulado) <ExternalLink className="ml-1.5 size-4" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Exibe um metadado curto do pedido confirmado com tipografia mono e destaque de cor opcional. */
function Meta({ label, value, isPrimary }: { label: string; value: string; isPrimary?: boolean }) {
  return (
    <div className="px-2 py-1 text-center sm:first:pl-0 sm:last:pr-0">
      <dt className="font-mono text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-mono text-xs font-bold",
          isPrimary ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
