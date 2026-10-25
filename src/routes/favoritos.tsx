// Tela de favoritos: resolve os NFTs salvos e oferece retorno à exploração.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { nftListQuery } from "@/api/queries";
import { NftCard, NftCardSkeleton } from "@/components/nft/NftCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites";
import { useSession } from "@/lib/session";

/** Rota da lista de NFTs salvos pelo colecionador. */
export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — Kurio" }, { name: "robots", content: "noindex" }] }),
  component: FavoritesPage,
});

/** Exibe estados de visitante, carregamento, lista e lista vazia. */
function FavoritesPage() {
  const { user } = useSession();
  const favorites = useFavorites();
  const catalog = useQuery({
    ...nftListQuery({ page: 1, pageSize: 48 }),
    enabled: !!user && favorites.isSuccess,
  });
  const ids = favorites.data ?? [];
  const items = catalog.data?.items.filter((nft) => ids.includes(nft.id)) ?? [];

  return (
    <section className="container-page min-h-[60vh] py-8" aria-labelledby="favorites-title">
      <h1 id="favorites-title" className="mb-6 text-2xl font-extrabold uppercase">
        Favoritos
      </h1>
      {!user ? (
        <div className="rounded-lg bg-card p-8 text-center">
          <p>Entre na sua conta para consultar seus favoritos.</p>
          <Button variant="brand" className="mt-4" asChild>
            <Link to="/login" search={{ redirect: "/favoritos" }}>
              Entrar
            </Link>
          </Button>
        </div>
      ) : favorites.isLoading || catalog.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <NftCardSkeleton key={index} />
          ))}
        </div>
      ) : favorites.isError || catalog.isError ? (
        <div role="alert" className="rounded-lg bg-card p-8 text-center">
          <p>Não foi possível carregar seus favoritos.</p>
          <Button
            variant="line"
            className="mt-4"
            onClick={() => {
              void favorites.refetch();
              void catalog.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {items.map((nft) => (
            <NftCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-card p-8 text-center">
          <p className="text-muted-foreground">Você ainda não salvou nenhum NFT.</p>
          <Button variant="explore" className="mt-4" asChild>
            <Link to="/" hash="catalogo" aria-label="Explorar NFTs">
              Explorar <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
