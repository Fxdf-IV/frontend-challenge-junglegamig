import { z } from "zod";

/** Catalog URL state: survives refresh and history navigation. */
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
export type CatalogSearch = z.infer<typeof catalogSearchSchema>;
export const SORTS = [
  ["recent", "Listados recentemente"],
  ["price-asc", "Menor preço"],
  ["price-desc", "Maior preço"],
  ["name", "Nome (A–Z)"],
] as const;
