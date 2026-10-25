// Stub leve para a biblioteca tldts no bundle do navegador do MSW.
// Evita empacotar a lista mundial de sufixos públicos (PSL de ~250KB),
// provendo a resolução de domínio necessária para o cookie-jar em tempo de execução.

/** Retorna o domínio de nível superior registrável para hostnames e endereços IP. */
export function getDomain(hostname: string | null | undefined): string | null {
  if (!hostname) return null;
  const parts = hostname.split(".");
  if (parts.length <= 1) return hostname;
  return parts.slice(-2).join(".");
}

/** Retorna o sufixo público aproximado para o hostname fornecido. */
export function getPublicSuffix(hostname: string | null | undefined): string | null {
  if (!hostname) return null;
  const parts = hostname.split(".");
  return parts[parts.length - 1] ?? null;
}

export default { getDomain, getPublicSuffix };
