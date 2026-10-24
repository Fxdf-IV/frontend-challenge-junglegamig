// Fundo da home usado sob os diálogos de autenticação no desktop.
import { Catalog } from "@/components/nft/Catalog";

/** Reutiliza o catálogo real como contexto visual inerte do modal de conta. */
export function AuthBackdrop() {
  return (
    <div aria-hidden="true" inert className="pointer-events-none hidden md:block">
      <section className="container-page grid items-center gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:py-12">
        <div className="md:pl-8">
          <p className="text-sm">Bem-vindo à Kurio</p>
          <h1 className="mt-4 text-5xl font-extrabold uppercase leading-[1.3]">
            Seja dono do futuro da arte digital
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
          </p>
        </div>
        <img
          src="/nft/emerald.webp"
          alt=""
          width={480}
          height={480}
          className="aspect-square w-full rounded-2xl object-cover"
        />
      </section>
      <Catalog search={{}} from="/" />
    </div>
  );
}
