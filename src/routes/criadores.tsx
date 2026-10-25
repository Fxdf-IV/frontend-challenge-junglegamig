// Rota editorial "/criadores" com indicação explícita de conteúdo em desenvolvimento.
import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

/** Definição da rota "/criadores" com metadados de cabeçalho. */
export const Route = createFileRoute("/criadores")({
  head: () => ({
    meta: [
      { title: "Criadores — Kurio" },
      { name: "description", content: "Perfis de criadores da Kurio em breve." },
      { property: "og:title", content: "Criadores — Kurio" },
      { property: "og:description", content: "Perfis de criadores em breve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Criadores" />,
});
