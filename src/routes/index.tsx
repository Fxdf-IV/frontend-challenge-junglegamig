// Home do marketplace: apresenta a busca móvel, o destaque da coleção e o catálogo.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { zodValidator } from "@tanstack/zod-adapter";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Catalog } from "@/components/nft/Catalog";
import { HomeEditorialSections } from "@/components/home/HomeEditorialSections";
import { catalogSearchSchema } from "@/lib/catalog-search";
import { Button } from "@/components/ui/button";

/** Rota inicial: apresenta o hero e o catálogo com busca preservada na URL. */
export const Route = createFileRoute("/")({
  validateSearch: zodValidator(catalogSearchSchema),
  head: () => ({
    meta: [
      { title: "Kurio — Seja dono do futuro da arte digital" },
      {
        name: "description",
        content:
          "Descubra NFTs selecionados de criadores emergentes e consagrados no marketplace Kurio.",
      },
      { property: "og:title", content: "Kurio — Marketplace de NFTs" },
      { property: "og:description", content: "Colecione arte digital rara e apoie artistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/** Renderiza a home com uma composição compacta para telas estreitas. */
function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState(search.q ?? "");
  useEffect(() => setQuery(search.q ?? ""), [search.q]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({
      search: (previous) => ({ ...previous, q: query.trim() || undefined, page: undefined }),
    });
  };
  return (
    <div className="pb-28 md:pb-0">
      <div className="container-page pt-4 md:hidden">
        <form onSubmit={submit} role="search" className="flex gap-2.5">
          <label htmlFor="home-search" className="sr-only">
            Explorar coleções
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Explorar coleções"
              className="h-11 w-full rounded-2xl border border-input/50 bg-card pl-11 pr-4 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="button"
            variant="brand"
            size="icon"
            aria-label="Ir para os filtros"
            className="h-11 w-11 rounded-2xl shadow-sm"
            onClick={() => window.dispatchEvent(new Event("kurio:open-catalog-filters"))}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </div>
      <section className="container-page my-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 max-md:rounded-3xl max-md:bg-hero-circles max-md:px-5 max-md:py-6 md:my-0 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:gap-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
        <div className="md:pl-8">
          <p className="text-[11px] text-foreground/80 md:text-sm">Bem-vindo à Kurio</p>
          <h1 className="mt-2 text-base font-extrabold uppercase leading-snug tracking-wide md:mt-4 md:text-3xl md:leading-tight lg:text-5xl lg:leading-[1.3]">
            <span className="md:hidden">
              Seja dono da
              <br />
              cultura digital
            </span>
            <span className="hidden md:inline">Seja dono do futuro da arte digital</span>
          </h1>
          <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground md:mt-4 md:max-w-xl md:text-sm">
            <span className="md:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>
            <span className="hidden md:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
              digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
          <div className="mt-3 md:mt-6">
            <Link
              to="/"
              hash="catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80 md:hidden"
            >
              Explorar <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Button variant="brand" size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/" hash="catalogo">
                Explorar
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative self-center">
          <img
            src="/nft/emerald.webp"
            alt="Emerald Ape #042, macaco ilustrado de óculos e jaqueta verde"
            width={480}
            height={480}
            fetchPriority="high"
            className="aspect-square w-28 rounded-2xl object-cover shadow-md md:w-full md:rounded-2xl"
          />
          <img
            src="/nft/sage.webp"
            alt=""
            aria-hidden="true"
            width={96}
            height={96}
            loading="lazy"
            className="absolute -bottom-3 -left-3 size-14 rounded-2xl border-2 border-card object-cover shadow-lg md:hidden"
          />
        </div>
        <div className="col-span-2 mt-2 flex justify-center gap-2 md:hidden" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-[#55321f]" />
          <span className="h-2 w-2 rounded-full bg-[#55321f]" />
        </div>
      </section>
      <Catalog search={search} from="/" />
      <HomeEditorialSections />
    </div>
  );
}
