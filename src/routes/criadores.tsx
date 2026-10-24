import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

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
