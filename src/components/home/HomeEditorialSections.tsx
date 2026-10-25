// Seções de destaque, campanhas e artigos que completam a página inicial do marketplace.
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { nftListQuery } from "@/api/queries";
import { Button } from "@/components/ui/button";
import { formatEth } from "@/lib/eth";

const JOURNAL = [
  {
    image: "/nft/neon.webp",
    alt: "Neon Vessel, macaco ilustrado de blazer escuro",
    date: "12 de setembro",
    read: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    summary: "Aprenda a colecionar, negociar e verificar ativos digitais.",
  },
  {
    image: "/nft/emerald.webp",
    alt: "Emerald Ape, macaco ilustrado de jaqueta verde",
    date: "13 de setembro",
    read: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    summary: "Conheça criadores que moldam a cultura digital.",
  },
  {
    image: "/nft/sage.webp",
    alt: "Sage Nomad, macaco ilustrado de chapéu e moletom roxo",
    date: "15 de setembro",
    read: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    summary: "Entenda raridade, procedência, direitos autorais e utilidade.",
  },
  {
    image: "/nft/golden.webp",
    alt: "Golden Beat, macaco ilustrado com fones de ouvido",
    date: "15 de setembro",
    read: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    summary: "Proteja sua carteira, seus ativos e sua identidade.",
  },
] as const;
/** Seleção e ordem dos cards na primeira página do destaque do Figma. */
const FEATURED_SAMPLE = [
  "Sage Nomad #046",
  "Golden Beat #207",
  "Golden Frequency #305",
  "Golden Signal #160",
] as const;

/** Completa a home com a oferta em destaque, campanhas e o diário editorial. */
export function HomeEditorialSections() {
  const nfts = useQuery(nftListQuery({ page: 1, pageSize: 48 }));
  const [page, setPage] = useState(1);
  const allNfts = nfts.data?.items ?? [];
  const firstPage = FEATURED_SAMPLE.map((name) => allNfts.find((nft) => nft.name === name)).filter(
    (nft) => nft !== undefined,
  );
  // As demais páginas usam quatro itens restantes do catálogo, sem repetir os destaques fixos.
  const picks =
    page === 1
      ? firstPage
      : allNfts
          .filter((nft) => !FEATURED_SAMPLE.some((name) => name === nft.name))
          .slice((page - 2) * 4, (page - 1) * 4);

  return (
    <div className="container-page space-y-14 pb-10 md:space-y-20">
      <section aria-labelledby="limited-title" className="pt-2">
        <div className="mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              NFT em destaque
            </p>
            <h2 id="limited-title" className="mt-1 text-lg font-extrabold uppercase md:text-2xl">
              Oferta limitada
            </h2>
          </div>
        </div>
        {nfts.isError ? (
          <p role="status" className="rounded-lg bg-card p-5 text-sm text-muted-foreground">
            Não foi possível carregar os destaques agora.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1.2fr_1fr_1fr_1fr] sm:gap-5 lg:gap-7">
            {nfts.isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className={`shimmer rounded-lg ${index === 0 ? "aspect-square sm:aspect-[5/6]" : "aspect-square"}`}
                  />
                ))
              : picks.map((nft) => (
                  <Link
                    key={nft.id}
                    to="/nft/$id"
                    params={{ id: nft.id }}
                    className="group min-w-0"
                  >
                    <div className="overflow-hidden rounded-lg bg-card p-2">
                      <img
                        src={nft.image}
                        alt={`Arte do NFT ${nft.name}`}
                        width={480}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        className={`w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-[1.03] ${nft.name === FEATURED_SAMPLE[0] && page === 1 ? "aspect-square sm:aspect-[5/6]" : "aspect-square"}`}
                      />
                    </div>
                    <h3 className="mt-2 truncate text-[11px] font-medium md:text-sm">{nft.name}</h3>
                    <p className="mt-0.5 text-xs font-bold text-primary md:text-sm">
                      {formatEth(nft.price)}
                    </p>
                  </Link>
                ))}
          </div>
        )}
        {!nfts.isError && !nfts.isLoading && (
          <nav aria-label="Paginação dos NFTs em destaque" className="mt-8 flex justify-end gap-1">
            {Array.from({ length: 4 }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                aria-current={page === number ? "page" : undefined}
                aria-label={`Página ${number}`}
                onClick={() => setPage(number)}
                className={`flex size-8 items-center justify-center rounded-sm border border-border text-xs transition-colors hover:bg-accent ${page === number ? "border-primary bg-primary text-primary-foreground" : ""}`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="Próxima página"
              disabled={page === 4}
              onClick={() => setPage((current) => Math.min(4, current + 1))}
              className="flex size-8 items-center justify-center rounded-sm border border-border text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden>›</span>
            </button>
          </nav>
        )}
      </section>

      <section aria-label="Explore lançamentos e artistas" className="grid gap-4 lg:grid-cols-2">
        <Campaign
          image="/nft/emerald.webp"
          alt="Emerald Ape usando óculos e jaqueta verde"
          title="Lançamentos gênesis de edição limitada"
          description="Colecione edições escassas de criadores selecionados antes que cheguem ao mercado."
          search={{ tab: "new" }}
        />
        <Campaign
          image="/nft/neon.webp"
          alt="Neon Vessel usando blazer e gola alta"
          title="Arte digital selecionada e muito mais"
          description="Explore novos artistas, coleções verificadas e obras digitais que definem a"
        />
      </section>

      <section aria-labelledby="journal-title">
        <header className="mb-5 text-center">
          <h2 id="journal-title" className="text-lg font-extrabold md:text-2xl">
            Diário da Cunhagem
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {JOURNAL.map((article) => (
            <article key={article.title} className="min-w-0 overflow-hidden rounded-lg bg-card">
              <img
                src={article.image}
                alt={article.alt}
                width={480}
                height={320}
                loading="lazy"
                decoding="async"
                className="aspect-[1.35/1] w-full object-cover"
              />
              <div className="p-3 md:p-4">
                <p className="text-[8px] text-muted-foreground md:text-[10px]">
                  {article.date} <span aria-hidden> | </span> {article.read}
                </p>
                <h3 className="mt-2 text-[10px] font-bold leading-snug md:text-sm">
                  {article.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-muted-foreground md:text-xs">
                  {article.summary}
                </p>
                <Link
                  to="/aprenda"
                  className="mt-2 inline-flex text-[9px] font-bold text-primary hover:underline md:text-xs"
                >
                  Ler mais{" "}
                  <span className="ml-1" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Apresenta uma campanha com imagem e chamada para uma parte existente do mercado. */
function Campaign({
  image,
  alt,
  title,
  description,
  search,
}: {
  image: string;
  alt: string;
  title: string;
  description: string;
  search?: { tab: "new" };
}) {
  return (
    <article className="grid grid-cols-[5.5rem_1fr] items-center gap-3 rounded-lg bg-card p-3 sm:grid-cols-[8rem_1fr] sm:gap-5 sm:p-4 md:grid-cols-[minmax(8rem,0.9fr)_1.1fr]">
      <img
        src={image}
        alt={alt}
        width={320}
        height={320}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full rounded-md object-cover"
      />
      <div className="text-center">
        <h3 className="text-[10px] font-bold leading-snug sm:text-xs md:text-sm">{title}</h3>
        <p className="mt-2 text-[8px] leading-relaxed text-muted-foreground sm:text-[10px] md:text-xs">
          {description}
        </p>
        <Button variant="brand" size="sm" className="mt-2 h-7 px-3 text-[9px]" asChild>
          {search ? (
            <Link to="/mercado" search={search}>
              Explorar
            </Link>
          ) : (
            <Link to="/mercado">Explorar</Link>
          )}
        </Button>
      </div>
    </article>
  );
}
