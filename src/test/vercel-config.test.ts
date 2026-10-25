// Garante que a Vercel trate o app como TanStack Start e preserve o SSR nas rotas.
import { readFileSync } from "node:fs";

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8")) as Record<string, unknown>;

describe("configuração da Vercel", () => {
  it("usa o adaptador TanStack Start sem substituir o roteamento SSR", () => {
    expect(vercelConfig.framework).toBe("tanstack-start");
    expect(vercelConfig.outputDirectory).toBeUndefined();
    expect(vercelConfig.rewrites).toBeUndefined();
  });
});
