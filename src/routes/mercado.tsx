import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Catalog } from "@/components/nft/Catalog";
import { catalogSearchSchema } from "@/lib/catalog-search";

export const Route = createFileRoute("/mercado")({
  validateSearch: zodValidator(catalogSearchSchema),
  head: () => ({
    meta: [
      { title: "Mercado — Kurio" },
      { name: "description", content: "Busque, filtre e ordene NFTs por coleção, rede e preço." },
      { property: "og:title", content: "Mercado de NFTs — Kurio" },
      { property: "og:description", content: "Catálogo completo de NFTs da Kurio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mercado,
});

function Mercado() {
  const search = Route.useSearch();
  return (
    <>
      <div className="container-page pt-8">
        <h1 className="text-2xl font-extrabold uppercase">Mercado</h1>
      </div>
      <Catalog search={search} from="/mercado" />
    </>
  );
}
