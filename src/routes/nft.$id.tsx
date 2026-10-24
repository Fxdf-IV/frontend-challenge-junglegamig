// Rota de detalhe do NFT: apresenta edição, atributos, favoritos e compra.
import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Link2,
  Mail,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { nftListQuery, nftQuery } from "@/api/queries";
import type { ApiError } from "@/api/client";
import type { EditionKind } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NftCard, NftCardSkeleton } from "@/components/nft/NftCard";
import { formatEth } from "@/lib/eth";
import { useCartMutations } from "@/lib/cart";
import { useFavorites, useToggleFavorite } from "@/lib/favorites";
import { useSession } from "@/lib/session";
import { NETWORK_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Metadados e validação da edição selecionada na URL. */
export const Route = createFileRoute("/nft/$id")({
  validateSearch: zodValidator(z.object({ edition: z.string().optional().catch(undefined) })),
  head: ({ params }) => ({
    meta: [
      { title: `NFT ${params.id} — Kurio` },
      { name: "description", content: "Detalhes, edições e compra deste NFT na Kurio." },
      { property: "og:title", content: "NFT na Kurio" },
      { property: "og:description", content: "Galeria, edições e compra deste NFT." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NftDetail,
});

const EDITION_LABEL: Record<EditionKind, string> = {
  "1/1": "1/1",
  "1/10": "1/10",
  "1/50": "1/50",
  aberta: "ABERTA",
};

/** Apresenta o NFT e suas ações com uma barra fixa no mobile. */
function NftDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/nft/$id" });
  const href = useRouterState({ select: (s) => s.location.href });
  const q = useQuery(nftQuery(id));
  const nft = q.data;
  const { user } = useSession();
  const favs = useFavorites();
  const toggleFav = useToggleFavorite();
  const { add } = useCartMutations();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);

  if (q.isError && (q.error as ApiError).status === 404)
    return (
      <section className="container-page grid min-h-[50vh] place-items-center text-center">
        <div>
          <h1 className="text-2xl font-bold">NFT não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este item não existe ou foi removido do mercado.
          </p>
          <Button variant="brand" className="mt-6" asChild>
            <Link to="/mercado">Ver mercado</Link>
          </Button>
        </div>
      </section>
    );
  if (q.isError)
    return (
      <section role="alert" className="container-page py-16 text-center">
        <p className="font-semibold">Não foi possível carregar este NFT.</p>
        <Button variant="brand" className="mt-4" onClick={() => q.refetch()}>
          Tentar novamente
        </Button>
      </section>
    );
  if (!nft) return <DetailSkeleton />;

  const requested = nft.editions.find((e) => e.kind === search.edition);
  const edition =
    requested ??
    nft.editions.find((e) => e.kind === "1/50" && e.available > 0) ??
    nft.editions.find((e) => e.available > 0) ??
    nft.editions[0];
  const limit = Math.min(edition.available, edition.maxPerOrder);
  const quantity = Math.min(Math.max(1, qty), Math.max(1, limit));
  const isFav = !!favs.data?.includes(nft.id);
  const unavailable = edition.available === 0;

  const onFav = () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: href } });
      return;
    }
    toggleFav.mutate({ id: nft.id, on: !isFav });
  };
  const onBuy = () =>
    add.mutate(
      { nftId: nft.id, edition: edition.kind, quantity },
      { onSuccess: () => navigate({ to: "/carrinho" }) },
    );
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/nft/${nft.id}` : "";

  return (
    <>
      <div className="container-page pb-40 pt-4 md:py-6">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link
            to="/mercado"
            aria-label="Voltar ao mercado"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-card px-3 text-sm"
          >
            <ArrowLeft aria-hidden /> Voltar
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFav}
            onClick={onFav}
          >
            <Heart className={cn(isFav && "fill-primary text-primary")} />
          </Button>
        </div>
        <nav aria-label="Trilha" className="mb-4 hidden text-sm font-semibold md:block">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>{" "}
          /{" "}
          <Link to="/mercado" className="hover:text-primary">
            Mercado
          </Link>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <ul className="flex gap-3 sm:flex-col" aria-label="Galeria">
              {nft.gallery.map((g, i) => (
                <li key={g}>
                  <button
                    onClick={() => setImg(i)}
                    aria-label={`Ver imagem ${i + 1}`}
                    aria-pressed={img === i}
                    className={cn(
                      "block h-16 w-16 overflow-hidden rounded-md border-2 sm:h-20 sm:w-20",
                      img === i ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img
                      src={g}
                      alt=""
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex-1 rounded-lg bg-card p-4">
              <img
                src={nft.gallery[img]}
                alt={`Arte do NFT ${nft.name}`}
                width={480}
                height={480}
                fetchPriority="high"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{nft.name}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <p className="text-xl font-bold text-primary" aria-live="polite">
                {formatEth(edition.price)}
              </p>
              <p className="flex items-center gap-1 text-xs">
                <span className="flex text-primary" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <span>
                  {nft.rating.toFixed(1)} · {nft.reviews} avaliações de colecionadores
                </span>
              </p>
            </div>
            <h2 className="mt-4 text-sm font-bold">Sobre este NFT:</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Um colecionável digital finalizado à mão da coleção {nft.collectionName}, verificado
              na {NETWORK_LABELS[nft.network]}, com arte desbloqueável e acesso para colecionadores.
            </p>
            <fieldset className="mt-4">
              <legend className="text-sm font-bold">Edição:</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {nft.editions.map((e) => (
                  <label
                    key={e.kind}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-xs has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                      e.kind === edition.kind ? "border-primary text-primary" : "border-border",
                      e.available === 0 && "line-through opacity-60",
                    )}
                  >
                    <input
                      type="radio"
                      name="edition"
                      className="sr-only"
                      checked={e.kind === edition.kind}
                      onChange={() => {
                        setQty(1);
                        navigate({
                          search: { edition: e.kind },
                          replace: true,
                          resetScroll: false,
                        });
                      }}
                    />
                    {EDITION_LABEL[e.kind]}
                    <span className="sr-only">
                      {e.available === 0 ? " (esgotada)" : ` (${e.available} disponíveis)`}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {unavailable
                  ? "Edição esgotada — escolha outra edição."
                  : `${edition.available} disponível(is) · máximo ${edition.maxPerOrder} por pedido`}
              </p>
              {requested === undefined && search.edition && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  A edição “{search.edition}” não existe para este NFT.
                </p>
              )}
            </fieldset>
            <div className="mt-4 hidden flex-wrap items-center justify-between gap-4 md:flex">
              <div className="flex items-center gap-3" role="group" aria-label="Quantidade">
                <Button
                  variant="round"
                  size="icon"
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1 || unavailable}
                  onClick={() => setQty(quantity - 1)}
                >
                  <Minus />
                </Button>
                <output aria-live="polite" className="w-6 text-center">
                  {quantity}
                </output>
                <Button
                  variant="round"
                  size="icon"
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= limit || unavailable}
                  onClick={() => setQty(quantity + 1)}
                >
                  <Plus />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="brand" disabled={unavailable || add.isPending} onClick={onBuy}>
                  {add.isPending ? "Adicionando…" : "Comprar"}
                </Button>
                <Button
                  variant="line"
                  onClick={onFav}
                  aria-pressed={isFav}
                  disabled={toggleFav.isPending}
                >
                  <Heart className={cn(isFav && "fill-primary text-primary")} />{" "}
                  {isFav ? "Favoritado" : "Favoritar"}
                </Button>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-xs text-muted-foreground">
              <div>
                <dt className="inline">ID do token: </dt>
                <dd className="inline">{nft.tokenId}</dd>
              </div>
              <div>
                <dt className="inline">Coleção: </dt>
                <dd className="inline">{nft.collectionName}</dd>
              </div>
              <div>
                <dt className="inline">Atributos: </dt>
                <dd className="inline">{nft.attributes.join(", ")}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-3 text-sm font-semibold">
              Compartilhar este NFT:
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copiar link"
                onClick={() =>
                  navigator.clipboard.writeText(shareUrl).then(
                    () => toast.success("Link copiado"),
                    () => toast.error("Não foi possível copiar"),
                  )
                }
              >
                <Link2 />
              </Button>
              <a
                aria-label="Compartilhar por e-mail"
                href={`mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(shareUrl)}`}
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                aria-label="Compartilhar no X (abre em nova aba)"
                target="_blank"
                rel="noreferrer noopener"
                href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              Detalhes do NFT
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              Avaliações ({nft.reviews})
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="details"
            className="space-y-4 pt-4 text-xs leading-relaxed text-muted-foreground"
          >
            <p>{nft.description}</p>
            <p>
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para
              colecionadores e um registro permanente de procedência. {nft.creator} recebe 5% de
              direitos autorais nas vendas secundárias.
            </p>
            <p>
              <strong className="text-foreground">Rede:</strong>
              <br />
              Cunhado na {NETWORK_LABELS[nft.network]} com procedência imutável e metadados
              armazenados no IPFS.
            </p>
            <p>
              <strong className="text-foreground">Contrato:</strong>
              <br />
              {nft.contract} · Contrato inteligente ERC-721 verificado.
            </p>
          </TabsContent>
          <TabsContent value="reviews" className="pt-4 text-xs text-muted-foreground">
            Média de {nft.rating.toFixed(1)} em {nft.reviews} avaliações. A listagem detalhada de
            avaliações não faz parte desta versão.
          </TabsContent>
        </Tabs>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-2" role="group" aria-label="Quantidade">
            <Button
              variant="round"
              size="icon"
              className="h-8 w-8"
              aria-label="Diminuir quantidade"
              disabled={quantity <= 1 || unavailable}
              onClick={() => setQty(quantity - 1)}
            >
              <Minus />
            </Button>
            <output aria-live="polite" className="w-5 text-center">
              {quantity}
            </output>
            <Button
              variant="round"
              size="icon"
              className="h-8 w-8"
              aria-label="Aumentar quantidade"
              disabled={quantity >= limit || unavailable}
              onClick={() => setQty(quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
          <strong className="whitespace-nowrap text-sm text-primary">
            {formatEth(edition.price)}
          </strong>
        </div>
        <div className="mx-auto mt-2 flex max-w-lg gap-2">
          <Button
            variant="brand"
            className="flex-1"
            disabled={unavailable || add.isPending}
            onClick={onBuy}
          >
            {add.isPending ? "Adicionando…" : "Comprar NFT"}
          </Button>
          <Button variant="line" size="icon" aria-label="Abrir carrinho" asChild>
            <Link to="/carrinho">
              <ShoppingCart />
            </Link>
          </Button>
        </div>
      </div>
      <MoreFromCollection collection={nft.collection} exclude={nft.id} />
    </>
  );
}

/** Sugere outros NFTs da coleção atual sem repetir o item aberto. */
function MoreFromCollection({ collection, exclude }: { collection: string; exclude: string }) {
  const q = useQuery(nftListQuery({ collections: [collection], pageSize: 6 }));
  const items = q.data?.items.filter((n) => n.id !== exclude).slice(0, 5);
  return (
    <section className="container-page mt-12" aria-labelledby="more-title">
      <h2 id="more-title" className="border-b border-border pb-2 text-sm font-bold text-primary">
        Mais desta coleção
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {!items ? (
          Array.from({ length: 5 }, (_, i) => <NftCardSkeleton key={i} />)
        ) : items.length ? (
          items.map((n) => <NftCard key={n.id} nft={n} />)
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum outro item nesta coleção.</p>
        )}
      </div>
    </section>
  );
}

/** Reserva dimensões próximas ao conteúdo do detalhe durante o carregamento. */
function DetailSkeleton() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Carregando NFT">
      <div className="shimmer mb-4 h-4 w-32 rounded" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="shimmer aspect-square rounded-lg" />
        <div className="space-y-3">
          <div className="shimmer h-8 w-2/3 rounded" />
          <div className="shimmer h-6 w-1/4 rounded" />
          <div className="shimmer h-24 rounded" />
          <div className="shimmer h-10 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
