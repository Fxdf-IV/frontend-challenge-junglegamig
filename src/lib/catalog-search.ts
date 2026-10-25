// Esquema de validação dos parâmetros de busca, filtros e ordenação do catálogo na URL.
import { z } from "zod";

/** Estado de busca do catálogo refletido na URL; preservado ao navegar e recarregar a página. */
export const catalogSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  collections: z.array(z.string()).optional().catch(undefined),
  networks: z.array(z.string()).optional().catch(undefined),
  min: z.string().optional().catch(undefined),
  max: z.string().optional().catch(undefined),
  sort: z.string().optional().catch(undefined),
  tab: z.string().optional().catch(undefined),
  page: z.number().int().optional().catch(undefined),
});

/** Tipo inferido dos parâmetros de pesquisa e paginação do catálogo. */
export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

/** Opções de ordenação disponíveis com rótulos em português. */
export const SORTS = [
  ["recent", "Listados recentemente"],
  ["price-asc", "Menor preço"],
  ["price-desc", "Maior preço"],
  ["name", "Nome (A–Z)"],
] as const;
