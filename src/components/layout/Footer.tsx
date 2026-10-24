import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const FEATURES = [
  {
    l: "W",
    t: "Segurança da carteira",
    d: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    l: "C",
    t: "Criadores em destaque",
    d: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    l: "D",
    t: "Alertas de lançamentos",
    d: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError("Informe um e-mail válido");
    setError("");
    setEmail("");
    // Newsletter is out of scope: be honest that nothing was subscribed.
    toast.info("A newsletter ainda não está disponível nesta demonstração.");
  };
  return (
    <footer className="container-page mt-20 pb-24 md:pb-10">
      <div className="grid gap-8 rounded-t-lg bg-card p-6 md:grid-cols-4 md:p-8">
        {FEATURES.map((f) => (
          <div key={f.l} className="md:border-r md:border-primary/50 md:pr-6">
            <div
              aria-hidden
              className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
            >
              {f.l}
            </div>
            <h2 className="mb-2 text-sm font-bold">{f.t}</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">{f.d}</p>
          </div>
        ))}
        <form onSubmit={submit} noValidate>
          <h2 className="mb-3 text-sm font-bold">Antecipe-se ao próximo lançamento</h2>
          <div className="flex">
            <label htmlFor="nl-email" className="sr-only">
              E-mail
            </label>
            <input
              id="nl-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "nl-err" : undefined}
              placeholder="digite seu e-mail..."
              className="h-10 min-w-0 flex-1 rounded-l-md border border-input bg-panel px-3 text-xs placeholder:text-muted-foreground"
            />
            <button className="h-10 rounded-r-md bg-primary px-3 text-sm font-bold text-primary-foreground">
              Enviar
            </button>
          </div>
          {error && (
            <p id="nl-err" className="mt-1 text-xs text-destructive">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </form>
      </div>
      <div className="grid gap-3 bg-band px-6 py-5 text-xs sm:grid-cols-4 sm:items-center md:px-8">
        <span className="font-bold tracking-[0.2em]">KURIO</span>
        <span>Feito para colecionadores, criadores e cultura</span>
        <a href="mailto:contato@email.com" className="hover:text-primary">
          contato@email.com
        </a>
        <a href="tel:+551140028922" className="hover:text-primary">
          +55 11 4002 8922
        </a>
      </div>
      <div className="grid grid-cols-2 gap-8 rounded-b-lg bg-card p-6 text-xs md:grid-cols-4 md:p-8">
        <FooterCol
          title="Meu perfil"
          links={[
            ["Minha conta", "/perfil"],
            ["Carteiras", "/carteiras"],
            ["Carrinho", "/carrinho"],
          ]}
        />
        <FooterCol
          title="Central de ajuda"
          links={[
            ["Como comprar NFTs", "/aprenda"],
            ["Carteira e segurança", "/aprenda"],
            ["Política do mercado", "/aprenda"],
          ]}
        />
        <div>
          <h2 className="mb-3 font-bold">Coleções</h2>
          <ul className="space-y-2 text-muted-foreground">
            {[
              ["Arte digital", "arte-digital"],
              ["Fotografia", "fotografia"],
              ["Música", "musica"],
              ["Utilidade", "utilidade"],
            ].map(([l, c]) => (
              <li key={c}>
                <Link to="/mercado" search={{ collections: [c] }} className="hover:text-primary">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-bold">Redes sociais</h2>
          <ul className="flex gap-2">
            {[
              [Facebook, "Facebook"],
              [Instagram, "Instagram"],
              [Twitter, "X"],
              [Linkedin, "LinkedIn"],
              [Youtube, "YouTube"],
            ].map(([Icon, n]) => {
              const I = Icon as typeof Facebook;
              return (
                <li key={n as string}>
                  <a
                    href={`https://www.${(n as string).toLowerCase() === "x" ? "x" : (n as string).toLowerCase()}.com`}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${n} (abre em nova aba)`}
                    className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground"
                  >
                    <I className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
          <h2 className="mb-2 mt-5 font-bold">Carteiras compatíveis</h2>
          <ul className="flex flex-wrap gap-1.5">
            {["MetaMask", "WalletConnect", "Coinbase"].map((w) => (
              <li
                key={w}
                className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="mb-3 font-bold">{title}</h2>
      <ul className="space-y-2 text-muted-foreground">
        {links.map(([l, h]) => (
          <li key={l}>
            <Link to={h} className="hover:text-primary">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
