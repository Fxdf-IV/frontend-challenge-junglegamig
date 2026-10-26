// Catálogo: sincroniza busca, filtros, ordenação e paginação com a URL.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { nftListQuery } from "@/api/queries";
import type { NftListResponse, NftSort } from "@/api/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollRevealSection } from "@/components/ui/ScrollRevealSection";
import { NftCard, NftCardSkeleton } from "./NftCard";
import { SORTS, type CatalogSearch } from "@/lib/catalog-search";
import { ethCmp } from "@/lib/eth";
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
    <ScrollRevealSection
      as="section"
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
          {/* Cabeçalho da barra de ferramentas do catálogo: abas, busca e ordenação alinhados ao Figma */}
          <div
            className={cn(
              "mb-6 flex flex-col gap-4",
              from === "/" && "xl:flex-row xl:items-center xl:justify-between",
            )}
          >
            {/* Abas de navegação de seção: sem barra de rolagem cinza nativa e sem quebra de texto */}
            <div
              role="tablist"
              aria-label="Seções do catálogo"
              className={cn(
                "no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[#3d2c20]/60 font-mono text-xs md:text-sm",
                from === "/" ? "xl:shrink-0" : "w-full",
              )}
            >
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={params.tab === id}
                  onClick={() => set({ tab: id === "all" ? undefined : id })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      set({ tab: id === "all" ? undefined : id });
                    }
                  }}
                  className={cn(
                    "-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 pb-2.5 transition-colors",
                    params.tab === id
                      ? "border-primary font-bold text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Controles de busca, ordenação e acionamento de filtros móveis */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start md:justify-end">
              {/* Campo de busca no catálogo exclusivo da rota do mercado */}
              <div
                className={cn(
                  "relative min-w-[14rem] max-w-sm flex-1 sm:max-w-md",
                  from === "/" && "hidden",
                )}
              >
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor="catalog-search-input" className="sr-only">
                  Buscar no catálogo
                </label>
                <input
                  id="catalog-search-input"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Explorar coleções"
                  className="h-9 w-full rounded-md border border-[#3d2c20] bg-[#19110a] pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
                />
              </div>

              {/* Seletor estilizado de ordenação de itens */}
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2 font-mono text-xs text-muted-foreground",
                  from === "/" && "max-md:hidden",
                )}
              >
                <label htmlFor="catalog-sort-select" className="whitespace-nowrap">
                  Ordenar por:
                </label>
                <div className="relative">
                  <select
                    id="catalog-sort-select"
                    value={params.sort}
                    onChange={(e) =>
                      set({ sort: e.target.value === "recent" ? undefined : e.target.value })
                    }
                    aria-label="Ordenar por:"
                    className="h-9 cursor-pointer appearance-none rounded-md border border-[#3d2c20] bg-[#19110a] pl-3 pr-8 font-mono text-xs text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
                  >
                    {SORTS.map(([v, l]) => (
                      <option key={v} value={v} className="bg-[#19110a] text-foreground">
                        {l}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#CFB28C]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Botão de acionamento do drawer de filtros em telas móveis */}
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
                  <NftCard key={n.id} nft={n} priority={from === "/mercado" && i === 0} />
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
          <div className="md:hidden mt-8">
            <FeaturedOffer />
          </div>
        </div>
      </div>
    </ScrollRevealSection>
  );
}

/** Mantém os intervalos de linha amplos o bastante para separar os cartões com deslocamento escalonado mobile. */
function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 max-md:pb-14 max-md:*:even:translate-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-10">
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
    set({ [key]: next.length ? next : undefined, page: undefined });
  };
  const lo = Number(search.min ?? "0.02");
  const hi = Number(search.max ?? "12.30");
  const [range, setRange] = useState<[number, number]>([lo, hi]);
  const [minInput, setMinInput] = useState<string>(
    search.min ? Number(search.min).toFixed(2) : "0.02",
  );
  const [maxInput, setMaxInput] = useState<string>(
    search.max ? Number(search.max).toFixed(2) : "12.30",
  );

  useEffect(() => {
    setRange([lo, hi]);
    setMinInput(search.min ? Number(search.min).toFixed(2) : "0.02");
    setMaxInput(search.max ? Number(search.max).toFixed(2) : "12.30");
  }, [lo, hi, search.min, search.max]);

  /** Atualiza o slider e reflete os novos valores nos inputs de texto em tempo real. */
  const handleSliderChange = (v: number[]) => {
    const next: [number, number] = [v[0], v[1]];
    setRange(next);
    setMinInput(next[0].toFixed(2));
    setMaxInput(next[1].toFixed(2));
  };

  /** Atualiza o input de preço mínimo e sincroniza o slider se for um número válido. */
  const handleMinChange = (val: string) => {
    setMinInput(val);
    const parsed = parseFloat(val.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      setRange((prev) => [Math.min(parsed, prev[1]), prev[1]]);
    }
  };

  /** Atualiza o input de preço máximo e sincroniza o slider se for um número válido. */
  const handleMaxChange = (val: string) => {
    setMaxInput(val);
    const parsed = parseFloat(val.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      setRange((prev) => [prev[0], Math.max(parsed, prev[0])]);
    }
  };

  /** Normaliza a exibição de preço mínimo ao perder o foco. */
  const handleMinBlur = () => {
    const parsed = parseFloat(minInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setMinInput(range[0].toFixed(2));
    } else {
      setMinInput(parsed.toFixed(2));
    }
  };

  /** Normaliza a exibição de preço máximo ao perder o foco. */
  const handleMaxBlur = () => {
    const parsed = parseFloat(maxInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setMaxInput(range[1].toFixed(2));
    } else {
      setMaxInput(parsed.toFixed(2));
    }
  };

  /** Aplica o filtro de faixa de preço validando e comparando via helpers exatos de ETH. */
  const handleApply = () => {
    const cleanMin = minInput.trim().replace(",", ".");
    const cleanMax = maxInput.trim().replace(",", ".");
    const validMin = /^\d+(\.\d{1,4})?$/.test(cleanMin) ? cleanMin : range[0].toFixed(2);
    const validMax = /^\d+(\.\d{1,4})?$/.test(cleanMax) ? cleanMax : range[1].toFixed(2);

    let loStr = validMin;
    let hiStr = validMax;
    if (ethCmp(loStr, hiStr) > 0) {
      const tmp = loStr;
      loStr = hiStr;
      hiStr = tmp;
    }

    const numLo = Number(loStr);
    const numHi = Number(hiStr);
    setRange([numLo, numHi]);
    setMinInput(loStr);
    setMaxInput(hiStr);

    set({
      min: ethCmp(loStr, "0.02") > 0 ? loStr : undefined,
      max: ethCmp(hiStr, "12.30") < 0 ? hiStr : undefined,
      page: undefined,
    });
  };

  /** Limpa os filtros de preço e restaura os valores de limite padrão. */
  const handleClear = () => {
    setRange([0.02, 12.3]);
    setMinInput("0.02");
    setMaxInput("12.30");
    set({ min: undefined, max: undefined, page: undefined });
  };

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
          onValueChange={handleSliderChange}
          aria-label="Faixa de preço em ETH"
          className="px-1"
        />

        {/* Inputs numéricos de Mínimo e Máximo sincronizados bidirecionalmente com o slider */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <label
              htmlFor="price-min-input"
              className="mb-1 block font-mono text-[10px] text-muted-foreground"
            >
              Mínimo
            </label>
            <div className="relative">
              <input
                id="price-min-input"
                type="text"
                inputMode="decimal"
                value={minInput}
                onChange={(e) => handleMinChange(e.target.value)}
                onBlur={handleMinBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                placeholder="0.02"
                aria-label="Preço mínimo em ETH"
                className="h-8 w-full rounded-md border border-[#3d2c20] bg-[#19110a] pl-2.5 pr-8 font-mono text-xs text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
              />
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground"
                aria-hidden="true"
              >
                ETH
              </span>
            </div>
          </div>

          <span className="mt-4 font-mono text-xs text-muted-foreground" aria-hidden="true">
            —
          </span>

          <div className="relative flex-1">
            <label
              htmlFor="price-max-input"
              className="mb-1 block font-mono text-[10px] text-muted-foreground"
            >
              Máximo
            </label>
            <div className="relative">
              <input
                id="price-max-input"
                type="text"
                inputMode="decimal"
                value={maxInput}
                onChange={(e) => handleMaxChange(e.target.value)}
                onBlur={handleMaxBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                placeholder="12.30"
                aria-label="Preço máximo em ETH"
                className="h-8 w-full rounded-md border border-[#3d2c20] bg-[#19110a] pl-2.5 pr-8 font-mono text-xs text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
              />
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground"
                aria-hidden="true"
              >
                ETH
              </span>
            </div>
          </div>
        </div>

        <p className="mt-2.5 font-mono text-xs text-muted-foreground">
          Preço: {range[0].toFixed(2).replace(".", ",")} - {range[1].toFixed(2).replace(".", ",")}{" "}
          ETH
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="brand" className="normal-case" onClick={handleApply}>
            Aplicar
          </Button>
          {(search.min || search.max) && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
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
        className="group block overflow-hidden rounded-2xl border border-transparent bg-card transition-all duration-300 hover:border-[#d28a4c]/30 hover:shadow-[0_8px_24px_rgba(210,138,76,0.14)] focus-visible:outline-offset-4"
      >
        <img
          src="/nft/sage.webp"
          alt="Sage Nomad #046 em oferta limitada"
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-full rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.05]"
        />
        <h4 className="sr-only">Sage Nomad #046</h4>
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
