import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Catalog } from "@/components/nft/Catalog";
import { catalogSearchSchema } from "@/lib/catalog-search";
import { Button } from "@/components/ui/button";

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

function Home() {
  const search = Route.useSearch();
  return (
    <>
      <section className="container-page grid items-center gap-8 py-8 md:grid-cols-[1fr_minmax(0,28rem)] md:py-12">
        <div className="md:pl-8">
          <p className="text-sm">Bem-vindo à Kurio</p>
          <h1 className="mt-4 text-3xl font-extrabold uppercase leading-tight md:text-5xl md:leading-[1.3]">
            Seja dono do futuro da arte digital
          </h1>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground md:text-sm">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital
            rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <Button variant="brand" className="mt-6" asChild>
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
          className="aspect-square w-full rounded-2xl object-cover"
        />
      </section>
      <Catalog search={search} from="/" />
    </>
  );
}
