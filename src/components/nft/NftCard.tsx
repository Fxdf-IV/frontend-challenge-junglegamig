import { Link } from "@tanstack/react-router";
import type { Nft } from "@/api/types";
import { formatEth } from "@/lib/eth";

export function NftCard({ nft, priority }: { nft: Nft; priority?: boolean }) {
  const soldOut = nft.editions.every((e) => e.available === 0);
  return (
    <article className="group">
      <Link to="/nft/$id" params={{ id: nft.id }} className="block rounded-lg focus-visible:outline-offset-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-card p-2">
          <img
            src={nft.image}
            alt={`Arte do NFT ${nft.name}`}
            width={480}
            height={480}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="h-full w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <h3 className="mt-3 truncate text-sm">{nft.name}</h3>
        <p className="mt-1 text-sm">
          <span className="font-bold text-primary">{formatEth(nft.price)}</span>
          {nft.compareAt && <s className="ml-2 text-muted-foreground" aria-label={`preço anterior ${formatEth(nft.compareAt)}`}>{formatEth(nft.compareAt)}</s>}
          {soldOut && <span className="ml-2 rounded bg-panel px-1.5 py-0.5 text-[10px] uppercase">Esgotado</span>}
        </p>
      </Link>
    </article>
  );
}

export function NftCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="shimmer aspect-square rounded-lg" />
      <div className="shimmer mt-3 h-4 w-3/4 rounded" />
      <div className="shimmer mt-2 h-4 w-1/3 rounded" />
    </div>
  );
}
