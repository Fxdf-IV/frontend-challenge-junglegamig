// Rodapé principal da aplicação com destaques institucionais, newsletter simulada, links de navegação alinhados ao Figma e redes sociais.
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScrollRevealSection } from "@/components/ui/ScrollRevealSection";
import {
  Bell,
  Facebook,
  Instagram,
  Linkedin,
  Palette,
  ShieldCheck,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

/** Destaques institucionais das três colunas superiores do rodapé com ícones temáticos ilustrativos (FD-35 / Comentário Figma #17). */
const FEATURES: {
  icon: LucideIcon;
  t: string;
  d: string;
}[] = [
  {
    icon: ShieldCheck,
    t: "Segurança da carteira",
    d: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    icon: Palette,
    t: "Criadores em destaque",
    d: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    icon: Bell,
    t: "Alertas de lançamentos",
    d: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

/** Lista de coleções oficiais disponíveis para filtro no catálogo a partir do rodapé. */
const COLLECTION_LINKS = [
  ["Arte digital", "arte-digital"],
  ["Fotografia", "fotografia"],
  ["Música", "musica"],
  ["Arte 3D", "arte-3d"],
  ["Utilidade", "utilidade"],
] as const;

/** Rodapé global com formulário informativo de newsletter, links do marketplace e redes sociais fiéis ao Figma. */
export function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  /** Processa submissão do formulário de newsletter com validação e aviso acessível de escopo. */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError("Informe um e-mail válido");
    setError("");
    setEmail("");
    // Newsletter fora do escopo funcional: notifica honestamente sem simular sucesso permanente.
    toast.info("A newsletter ainda não está disponível nesta demonstração.");
  };

  /** Alerta acessível para funcionalidades que não estão contempladas no escopo avaliado. */
  const notifyUnavailable = (feature: string) => {
    toast.info(`${feature}: funcionalidade indisponível no momento`);
  };

  return (
    <footer className="container-page mt-20 pb-24 md:pb-10">
      {/* Bloco superior: 3 cards institucionais e formulário de newsletter */}
      <ScrollRevealSection className="grid gap-8 rounded-t-lg bg-card p-6 md:grid-cols-4 md:p-8">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.t} className="md:border-r md:border-primary/50 md:pr-6">
              <div
                aria-hidden="true"
                className="mb-4 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"
              >
                <Icon className="size-6 text-primary-foreground" strokeWidth={2.2} />
              </div>
              <h2 className="mb-2 text-sm font-bold">{f.t}</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          );
        })}
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
            <button className="h-10 rounded-r-md bg-primary px-3 text-sm font-bold text-primary-foreground cursor-pointer">
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
      </ScrollRevealSection>

      {/* Faixa intermediária horizontal de identificação institucional */}
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

      {/* Bloco inferior com as quatro colunas oficiais do Figma */}
      <div className="grid grid-cols-2 gap-6 rounded-b-lg bg-card p-4 text-xs sm:gap-8 sm:p-6 md:grid-cols-4 md:p-8">
        {/* Coluna 1: Meu perfil */}
        <div className="min-w-0">
          <h2 className="mb-3 font-mono text-sm font-bold text-foreground">Meu perfil</h2>
          <ul className="space-y-2 font-mono text-xs text-muted-foreground">
            <li>
              <Link to="/perfil" className="transition-colors hover:text-primary">
                Meu perfil
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => notifyUnavailable("Minha coleção")}
                className="cursor-pointer text-left transition-colors hover:text-primary"
              >
                Minha coleção
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => notifyUnavailable("Atividade")}
                className="cursor-pointer text-left transition-colors hover:text-primary"
              >
                Atividade
              </button>
            </li>
            <li>
              <Link to="/criadores" className="transition-colors hover:text-primary">
                Estúdio do criador
              </Link>
            </li>
            <li>
              <Link to="/favoritos" className="transition-colors hover:text-primary">
                Lista de interesse
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 2: Central de ajuda */}
        <div className="min-w-0">
          <h2 className="mb-3 font-mono text-sm font-bold text-foreground">Central de ajuda</h2>
          <ul className="space-y-2 font-mono text-xs text-muted-foreground">
            <li>
              <Link to="/aprenda" className="transition-colors hover:text-primary">
                Central de ajuda
              </Link>
            </li>
            <li>
              <Link to="/aprenda" className="transition-colors hover:text-primary">
                Como comprar NFTs
              </Link>
            </li>
            <li>
              <Link to="/aprenda" className="transition-colors hover:text-primary">
                Carteira e segurança
              </Link>
            </li>
            <li>
              <Link to="/aprenda" className="transition-colors hover:text-primary">
                Política do mercado
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => notifyUnavailable("Denunciar item")}
                className="cursor-pointer text-left transition-colors hover:text-primary"
              >
                Denunciar item
              </button>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Coleções */}
        <div className="min-w-0">
          <h2 className="mb-3 font-mono text-sm font-bold text-foreground">Coleções</h2>
          <ul className="space-y-2 font-mono text-xs text-muted-foreground">
            {COLLECTION_LINKS.map(([label, slug]) => (
              <li key={slug}>
                <Link
                  to="/mercado"
                  search={{ collections: [slug] }}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 4: Redes sociais e Carteiras compatíveis */}
        <div className="min-w-0">
          <h2 className="mb-3 font-mono text-sm font-bold text-foreground">Redes sociais</h2>
          <ul className="flex flex-wrap gap-2">
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
                    className="grid size-8 place-items-center rounded-md border border-[#3d2c20] bg-transparent text-[#CFB28C] transition-colors hover:border-primary hover:text-primary"
                  >
                    <I className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
          <h2 className="mb-2.5 mt-5 font-mono text-sm font-bold text-foreground">
            Carteiras compatíveis
          </h2>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-md border border-[#3d2c20] bg-[#24180f] px-2.5 py-1.5 text-center font-mono text-[9px] tracking-wide text-primary sm:text-[10px]">
            <span>METAMASK</span>
            <span aria-hidden="true" className="text-muted-foreground">
              •
            </span>
            <span>WALLETCONNECT</span>
            <span aria-hidden="true" className="text-muted-foreground">
              •
            </span>
            <span>COINBASE</span>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
