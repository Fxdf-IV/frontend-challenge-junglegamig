// Home do marketplace: apresenta a busca móvel, o destaque da coleção e o catálogo.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { zodValidator } from "@tanstack/zod-adapter";
import { Search, SlidersHorizontal } from "lucide-react";
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
    <>
      <div className="container-page pt-4 md:hidden">
        <form onSubmit={submit} role="search" className="flex gap-2">
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
              className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm"
            />
          </div>
          <Button
            type="button"
            variant="brand"
            size="icon"
            aria-label="Ir para os filtros"
            onClick={() => window.dispatchEvent(new Event("kurio:open-catalog-filters"))}
          >
            <SlidersHorizontal />
          </Button>
        </form>
      </div>
      <section className="container-page grid grid-cols-[minmax(0,1fr)_8rem] items-center gap-4 py-5 max-md:rounded-2xl max-md:bg-card max-md:!px-4 max-md:py-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:gap-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
        <div className="md:pl-8">
          <p className="text-[10px] md:text-sm">Bem-vindo à Kurio</p>
          <h1 className="mt-2 text-base font-extrabold uppercase leading-tight md:mt-4 md:text-3xl md:leading-tight lg:text-5xl lg:leading-[1.3]">
            <span className="md:hidden">Seja dono da cultura digital</span>
            <span className="hidden md:inline">Seja dono do futuro da arte digital</span>
          </h1>
          <p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-muted-foreground md:mt-4 md:max-w-xl md:text-sm">
            <span className="md:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>
            <span className="hidden md:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
              digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
          <Button variant="brand" size="sm" className="mt-3 md:mt-6" asChild>
            <Link to="/" hash="catalogo">
              Explorar
            </Link>
          </Button>
        </div>
        <img
          src="/nft/emerald.webp"
          alt="Emerald Ape #042, macaco ilustrado de óculos e jaqueta verde"
          width={480}
          height={480}
          fetchPriority="high"
          className="aspect-square w-full rounded-xl object-cover md:rounded-2xl"
        />
      </section>
      <Catalog search={search} from="/" />
      <HomeEditorialSections />
    </>
  );
}
