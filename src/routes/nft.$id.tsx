// Rota de detalhe do NFT: apresenta edição, atributos, favoritos e compra.
import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
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
import { ethMul, formatEth } from "@/lib/eth";
import { useCartMutations } from "@/lib/cart";
import { useFavorites, useToggleFavorite } from "@/lib/favorites";
import { useSession } from "@/lib/session";
import { NETWORK_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Metadados e validação da edição selecionada na URL. */
export const Route = createFileRoute("/nft/$id")({
  validateSearch: zodValidator(z.object({ edition: z.string().optional().catch(undefined) })),
  head: ({ params }) => {
    const slug = params.id.toLowerCase();
    const image = slug.includes("emerald")
      ? "/nft/emerald.webp"
      : slug.includes("neon")
        ? "/nft/neon.webp"
        : slug.includes("sage")
          ? "/nft/sage.webp"
          : slug.includes("golden")
            ? "/nft/golden.webp"
            : undefined;
    return {
      meta: [
        { title: `NFT ${params.id} — Kurio` },
        { name: "description", content: "Detalhes, edições e compra deste NFT na Kurio." },
        { property: "og:title", content: "NFT na Kurio" },
        { property: "og:description", content: "Galeria, edições e compra deste NFT." },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: image ? [{ rel: "preload", as: "image", href: image, fetchPriority: "high" }] : [],
    };
  },
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
  // Reinicia a miniatura e a quantidade ao navegar entre itens da mesma coleção.
  useEffect(() => {
    setImg(0);
    setQty(1);
  }, [id]);

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
  const onAddToCart = () =>
    add.mutate(
      { nftId: nft.id, edition: edition.kind, quantity },
      {
        onSuccess: () => toast.success("NFT adicionado ao carrinho"),
        onError: (err) => toast.error(err.message),
      },
    );
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/nft/${nft.id}` : "";

  return (
    <>
      <div className="container-page pb-40 pt-4 md:py-6">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Voltar"
            className="rounded-full border-primary/60 bg-transparent text-primary hover:bg-primary/10"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFav}
            className="rounded-full border-primary/60 bg-transparent text-primary hover:bg-primary/10"
            onClick={onFav}
          >
            <Heart className={cn("size-5", isFav && "fill-primary text-primary")} />
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <ul className="hidden gap-3 sm:flex sm:flex-col" aria-label="Galeria">
              {nft.gallery.map((g, i) => (
                // As miniaturas podem compartilhar o mesmo asset na fixture; índice garante chave única.
                <li key={`${g}-${i}`}>
                  <button
                    type="button"
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
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex-1 rounded-lg bg-card p-4">
              <img
                src={nft.gallery[img] ?? nft.image}
                alt={`Arte do NFT ${nft.name}`}
                width={480}
                height={480}
                fetchPriority="high"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold md:text-2xl">{nft.name}</h1>
              <p
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] md:hidden"
                aria-label={`${nft.rating.toFixed(1)} de 5, ${nft.reviews} avaliações`}
              >
                <Star className="h-3 w-3 fill-primary text-primary" aria-hidden />
                {nft.rating.toFixed(1)} ({nft.reviews})
              </p>
            </div>
            <div className="mt-2 hidden flex-wrap items-center justify-between gap-2 border-b border-border pb-3 md:flex">
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
            <h2 className="mt-4 hidden text-sm font-bold md:block">Sobre este NFT:</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Um colecionável digital {EDITION_LABEL[edition.kind]} finalizado à mão da coleção
              Kurio Editions, verificado na {NETWORK_LABELS[nft.network]}, com arte desbloqueável e
              acesso para colecionadores.
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
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="brand" disabled={unavailable || add.isPending} onClick={onBuy}>
                  {add.isPending ? "Adicionando…" : "Comprar"}
                </Button>
                <Button
                  type="button"
                  variant="line"
                  disabled={unavailable || add.isPending}
                  onClick={onAddToCart}
                  className="gap-2 font-mono text-xs font-semibold"
                >
                  <ShoppingCart className="size-4 text-primary" />
                  {add.isPending ? "Adicionando…" : "Adicionar ao carrinho"}
                </Button>
                <Button
                  type="button"
                  variant="line"
                  onClick={onFav}
                  aria-pressed={isFav}
                  disabled={toggleFav.isPending}
                  className="gap-2 font-mono text-xs font-semibold"
                >
                  <Heart className={cn("size-4", isFav && "fill-primary text-primary")} />{" "}
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
      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[1.5rem] border-t border-border/40 bg-card/95 px-6 pt-5 pb-6 shadow-[0_-0.5rem_1.5rem_rgb(0_0_0/0.45)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm" role="group" aria-label="Quantidade">
            <span className="text-xs font-semibold">Qtd.</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7 rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              aria-label="Diminuir quantidade"
              disabled={quantity <= 1 || unavailable}
              onClick={() => setQty(quantity - 1)}
            >
              <Minus className="size-3.5" />
            </Button>
            <output aria-live="polite" className="w-5 text-center font-bold">
              {quantity}
            </output>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7 rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              aria-label="Aumentar quantidade"
              disabled={quantity >= limit || unavailable}
              onClick={() => setQty(quantity + 1)}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <strong className="whitespace-nowrap text-lg font-bold text-primary">
            {formatEth(ethMul(edition.price, quantity))}
          </strong>
        </div>
        <div className="mx-auto mt-4 flex max-w-lg items-center gap-3">
          <Button
            className="h-14 flex-1 rounded-full bg-linear-to-br from-primary to-[color-mix(in_oklab,var(--primary),black_30%)] text-base font-bold text-primary-foreground uppercase shadow-md active:scale-[0.98] transition-transform"
            disabled={unavailable || add.isPending}
            onClick={onBuy}
          >
            {unavailable ? "Esgotado" : add.isPending ? "Adicionando…" : "Comprar NFT"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-14 rounded-full border-border bg-[#2f1d15] text-primary hover:bg-[#2f1d15]/80 flex items-center justify-center shrink-0 shadow-md"
            aria-label="Adicionar ao carrinho"
            disabled={unavailable || add.isPending}
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-5" />
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

/** Reserva dimensões próximas ao conteúdo do detalhe durante o carregamento para evitar CLS. */
function DetailSkeleton() {
  return (
    <div
      className="container-page min-h-[72rem] pb-40 pt-4 md:min-h-[60rem] md:py-6"
      aria-busy="true"
      aria-label="Carregando NFT"
    >
      <div className="mb-4 flex items-center justify-between md:hidden">
        <Link
          to="/mercado"
          aria-label="Voltar ao mercado"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <ChevronLeft className="size-5" aria-hidden />
          <span className="sr-only">Voltar</span>
        </Link>
        <span className="text-xs text-muted-foreground">Carregando NFT…</span>
      </div>
      <div className="shimmer mb-4 hidden h-4 w-32 rounded md:block" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
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
