// Card de NFT para grades de catálogo: apresenta arte limpa fiel ao Figma, preço e atalho de favoritos.
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Nft } from "@/api/types";
import { formatEth } from "@/lib/eth";
import { useFavorites, useToggleFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

/**
 * Renderiza o card individual com imagem recortada limpa conforme o Figma,
 * preço em ETH e botão de favoritar otimista no canto superior.
 */
export function NftCard({ nft, priority }: { nft: Nft; priority?: boolean }) {
  const soldOut = nft.editions.every((e) => e.available === 0);
  const { data: favIds } = useFavorites();
  const toggle = useToggleFavorite();
  const isFav = favIds?.includes(nft.id) ?? false;

  return (
    <article className="group relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ease-[cubic-bezier(0.16,1,0.3,1)]">
      <Link
        to="/nft/$id"
        params={{ id: nft.id }}
        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-transparent bg-card transition-all duration-300 group-hover:border-[#d28a4c]/35 group-hover:shadow-[0_10px_25px_-5px_rgba(210,138,76,0.16)]">
          <img
            src={nft.image}
            alt={`Arte do NFT ${nft.name}`}
            width={480}
            height={480}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="h-full w-full rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.06]"
          />
          <button
            type="button"
            aria-label={isFav ? `Remover dos salvos: ${nft.name}` : `Salvar ${nft.name} nos salvos`}
            aria-pressed={isFav}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle.mutate({ id: nft.id, on: !isFav });
            }}
            className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-background/90 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Heart className={cn("size-4", isFav && "fill-red-500 text-red-500")} />
          </button>
        </div>
        <h3 className="mt-2.5 truncate text-xs font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
          {nft.name}
        </h3>
        <p className="mt-1 flex items-baseline gap-2 text-xs">
          <span className="font-bold text-primary">{formatEth(nft.price)}</span>
          {nft.compareAt && (
            <s
              className="text-muted-foreground"
              aria-label={`preço anterior ${formatEth(nft.compareAt)}`}
            >
              {formatEth(nft.compareAt)}
            </s>
          )}
          {soldOut && (
            <span className="rounded bg-panel px-1.5 py-0.5 text-[10px] uppercase">Esgotado</span>
          )}
        </p>
      </Link>
    </article>
  );
}

/** Esqueleto de carregamento com shimmer nas mesmas proporções do cartão. */
export function NftCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="shimmer aspect-square rounded-2xl" />
      <div className="shimmer mt-3 h-4 w-3/4 rounded" />
      <div className="shimmer mt-2 h-4 w-1/3 rounded" />
    </div>
  );
}
