// Configuração do Vite com TanStack Start, Nitro, React e Tailwind CSS v4.
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      tldts: path.resolve(__dirname, "src/lib/tldts-stub.ts"),
    },
  },
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    nitro({
      compressPublicAssets: true,
    }),
    react(),
    tailwindcss(),
  ],
});
