// Catálogo: sincroniza busca, filtros, ordenação e paginação com a URL.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { nftListQuery } from "@/api/queries";
import type { NftListResponse, NftSort } from "@/api/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NftCard, NftCardSkeleton } from "./NftCard";
import { SORTS, type CatalogSearch } from "@/lib/catalog-search";
import { cn } from "@/lib/utils";

const TABS = [
  ["all", "Todos os NFTs"],
  ["new", "Novos lançamentos"],
  ["trending", "Em alta"],
] as const;

/** Renderiza filtros e resultados para a home ou para a rota de mercado. */
export function Catalog({ search, from }: { search: CatalogSearch; from: "/" | "/mercado" }) {
  const navigate = useNavigate({ from });
  const params = {
    q: search.q,
    collections: search.collections,
    networks: search.networks,
    min: search.min,
    max: search.max,
    sort: (search.sort as NftSort) ?? "recent",
    tab: (search.tab as "all" | "new" | "trending") ?? "all",
    page: Math.max(1, search.page ?? 1),
    pageSize: 9,
  };
  const query = useQuery(nftListQuery(params));
  const data = query.data;
  // Qualquer mudança de filtro ou ordenação reinicia a paginação na URL.
  const set = (patch: Partial<CatalogSearch>) =>
    navigate({
      search: (prev: CatalogSearch) => ({
        ...prev,
        ...patch,
        page: "page" in patch ? patch.page : undefined,
      }),
      resetScroll: false,
    });

  const [q, setQ] = useState(search.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  useEffect(() => {
    const openFilters = () => setFiltersOpen(true);
    window.addEventListener("kurio:open-catalog-filters", openFilters);
    return () => window.removeEventListener("kurio:open-catalog-filters", openFilters);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((q.trim() || undefined) !== search.q) set({ q: q.trim() || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- aplica debounce só sobre o texto digitado para não reexecutar ao navegar na URL.
  }, [q]);

  const activeCount =
    (search.collections?.length ?? 0) +
    (search.networks?.length ?? 0) +
    (search.min || search.max ? 1 : 0);
  const filters = <Filters data={data} search={search} set={set} />;

  return (
    <section
      id="catalogo"
      aria-labelledby="catalog-title"
      className="container-page scroll-mt-20 py-10"
    >
      <h2 id="catalog-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <div className="grid gap-8 md:grid-cols-[15rem_1fr]">
        <aside className="hidden md:block" aria-label="Filtros">
          {filters}
          <FeaturedOffer />
        </aside>
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              aria-label="Seções do catálogo"
              className="flex gap-5 overflow-x-auto text-sm"
            >
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={params.tab === id}
                  onClick={() => set({ tab: id === "all" ? undefined : id })}
                  className={cn(
                    "whitespace-nowrap border-b-2 pb-1",
                    params.tab === id
                      ? "border-primary text-primary"
                      : "border-transparent hover:text-primary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label
                className={cn(
                  "relative min-w-0 flex-1 lg:w-56 lg:flex-none",
                  from === "/" && "hidden",
                )}
              >
                <span className="sr-only">Buscar no catálogo</span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Explorar coleções"
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground"
                />
              </label>
              <label
                className={cn("flex items-center gap-2 text-sm", from === "/" && "max-md:hidden")}
              >
                <span className="whitespace-nowrap">Ordenar por:</span>
                <select
                  value={params.sort}
                  onChange={(e) =>
                    set({ sort: e.target.value === "recent" ? undefined : e.target.value })
                  }
                  className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                >
                  {SORTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    id="catalog-filters-trigger"
                    variant="line"
                    size="sm"
                    className={cn("md:hidden", from === "/" && "hidden")}
                  >
                    <SlidersHorizontal /> Filtros {activeCount > 0 && `(${activeCount})`}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6">
                    {filters}
                    <FeaturedOffer />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {query.isFetching ? "Carregando NFTs" : data ? `${data.total} NFTs encontrados` : ""}
          </p>

          {query.isError && !data ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/50 bg-card p-8 text-center"
            >
              <p className="font-semibold">Não foi possível carregar o catálogo.</p>
              <p className="mt-1 text-sm text-muted-foreground">{(query.error as Error).message}</p>
              <Button variant="brand" className="mt-4" onClick={() => query.refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : !data ? (
            <Grid>
              {Array.from({ length: 9 }, (_, i) => (
                <NftCardSkeleton key={i} />
              ))}
            </Grid>
          ) : data.items.length === 0 ? (
            <div className="rounded-lg bg-card p-10 text-center">
              <p className="font-semibold">Nenhum NFT encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste a busca ou os filtros para ver mais resultados.
              </p>
              {(activeCount > 0 || search.q) && (
                <Button variant="line" className="mt-4" onClick={() => navigate({ search: {} })}>
                  <X /> Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}
              aria-busy={query.isFetching}
            >
              <Grid>
                {data.items.map((n, i) => (
                  <NftCard key={n.id} nft={n} priority={i < 3} />
                ))}
              </Grid>
              {query.isError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  Falha ao atualizar.{" "}
                  <button className="underline" onClick={() => query.refetch()}>
                    Tentar novamente
                  </button>
                </p>
              )}
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPage={(p) => set({ page: p === 1 ? undefined : p })}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Mantém os intervalos de linha amplos o bastante para separar os cartões. */
function Grid({ children }: { children: React.ReactNode }) {
  // O espaçamento vertical atende à observação #61 sem aumentar o intervalo horizontal.
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3">
      {children}
    </div>
  );
}

/** Aplica filtros da coleção, rede e faixa de preço. */
function Filters({
  data,
  search,
  set,
}: {
  data?: NftListResponse;
  search: CatalogSearch;
  set: (p: Partial<CatalogSearch>) => void;
}) {
  const toggle = (key: "collections" | "networks", v: string) => {
    const cur = search[key] ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    set({ [key]: next.length ? next : undefined });
  };
  const lo = Number(search.min ?? "0.02");
  const hi = Number(search.max ?? "12.30");
  const [range, setRange] = useState<[number, number]>([lo, hi]);
  useEffect(() => setRange([lo, hi]), [lo, hi]);

  return (
    <div className="space-y-6 rounded-lg bg-card p-4">
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Coleções</legend>
        <ul className="space-y-1">
          {(data?.facets.collections ?? []).map((f) => (
            <FacetRow
              key={f.value}
              label={f.label}
              count={f.count}
              checked={!!search.collections?.includes(f.value)}
              onChange={() => toggle("collections", f.value)}
            />
          ))}
          {!data &&
            Array.from({ length: 9 }, (_, i) => <li key={i} className="shimmer h-7 rounded" />)}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Faixa de preço</legend>
        <Slider
          min={0.02}
          max={12.3}
          step={0.01}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1]])}
          aria-label="Faixa de preço em ETH"
          className="px-1"
        />
        <p className="mt-3 text-xs">
          Preço: {range[0].toFixed(2).replace(".", ",")} - {range[1].toFixed(2).replace(".", ",")}{" "}
          ETH
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="brand"
            className="normal-case"
            onClick={() =>
              set({
                min: range[0] > 0.02 ? range[0].toFixed(2) : undefined,
                max: range[1] < 12.3 ? range[1].toFixed(2) : undefined,
              })
            }
          >
            Aplicar
          </Button>
          {(search.min || search.max) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => set({ min: undefined, max: undefined })}
            >
              Limpar
            </Button>
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Rede</legend>
        <ul className="space-y-1">
          {(data?.facets.networks ?? []).map((f) => (
            <FacetRow
              key={f.value}
              label={f.label}
              count={f.count}
              checked={!!search.networks?.includes(f.value)}
              onChange={() => toggle("networks", f.value)}
            />
          ))}
        </ul>
      </fieldset>
    </div>
  );
}

/** Card vertical de oferta limitada posicionado na coluna lateral abaixo dos filtros, como no Figma. */
function FeaturedOffer() {
  return (
    <div aria-labelledby="featured-offer-title" className="mt-5">
      <div className="rounded-t-lg bg-card px-4 py-3 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          NFT em destaque
        </p>
        <h3
          id="featured-offer-title"
          className="mt-1 text-xs font-extrabold uppercase tracking-wider text-foreground"
        >
          Oferta limitada
        </h3>
      </div>
      <Link
        to="/nft/$id"
        params={{ id: "sage-nomad-046" }}
        aria-label="Ver oferta limitada: Sage Nomad #046"
        className="group block overflow-hidden rounded-2xl bg-card focus-visible:outline-offset-4"
      >
        <img
          src="/nft/sage.webp"
          alt="Sage Nomad #046 em oferta limitada"
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
    </div>
  );
}

/** Expõe cada faceta como um botão acessível sem caixa visual. */
function FacetRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={checked}
        onClick={onChange}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs hover:bg-panel",
          checked && "text-primary",
        )}
      >
        <span>{label}</span>
        <span>({count})</span>
      </button>
    </li>
  );
}

/** Controla a navegação entre páginas do catálogo. */
function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="mt-10 flex justify-end gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button
          key={p}
          size="icon"
          variant={p === page ? "default" : "secondary"}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Página ${p}`}
          onClick={() => onPage(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Próxima página"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
