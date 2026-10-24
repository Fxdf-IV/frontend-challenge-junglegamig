import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/aprenda")({
  head: () => ({
    meta: [
      { title: "Aprenda — Kurio" },
      { name: "description", content: "Guias sobre NFTs e carteiras em breve." },
      { property: "og:title", content: "Aprenda — Kurio" },
      { property: "og:description", content: "Guias editoriais em breve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Aprenda" />,
});
