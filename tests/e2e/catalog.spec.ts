// Cobre URL, resultados e histórico da navegação no catálogo de NFTs.
import { expect, test, type Page } from "@playwright/test";

async function openCollectionFilter(page: Page) {
  const trigger = page.getByRole("button", { name: /Filtros/ });
  if (await trigger.isVisible()) await trigger.click();
  return page.getByRole("button", { name: /^Arte 3D/ });
}

test("sincroniza busca, coleção e histórico com a URL", async ({ page }) => {
  await page.goto("/mercado?scenario=default&page=3");
  await expect(page.getByRole("button", { name: "Página 3" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("searchbox", { name: "Buscar no catálogo" }).fill("Golden");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("Golden");
  await expect.poll(() => new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();

  await (await openCollectionFilter(page)).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("collections"))
    .toBe(JSON.stringify(["arte-3d"]));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();

  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get("collections")).toBeNull();
  await expect(page.getByRole("heading", { name: "Golden Beat #207" })).toBeVisible();
  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBeNull();
  await expect(page.getByRole("button", { name: "Página 3" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("ordena o catálogo por preço crescente", async ({ page, isMobile }) => {
  test.skip(isMobile, "O seletor de ordenação não aparece no frame mobile fornecido.");

  await page.goto("/mercado?scenario=default");
  await expect(page.getByText("40 NFTs encontrados")).toBeVisible();
  await page.getByLabel("Ordenar por:").selectOption("price-asc");

  await expect.poll(() => new URL(page.url()).searchParams.get("sort")).toBe("price-asc");
  await expect(page.getByRole("heading", { name: /^Onyx Curator/ }).first()).toBeVisible();
});

test("paginação acompanha voltar do navegador", async ({ page }) => {
  await page.goto("/mercado?scenario=default");
  await page.getByRole("button", { name: "Página 2" }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(page.getByRole("button", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.getByRole("button", { name: "Página 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mostra estado vazio no cenário determinístico", async ({ page }) => {
  await page.goto("/mercado?scenario=empty");

  await expect(page.getByText("Nenhum NFT encontrado")).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
});

test("mantém os resultados da última aba durante respostas com latência variável", async ({
  page,
}) => {
  await page.goto("/mercado?scenario=jitter");
  await expect(page.getByText("40 NFTs encontrados")).toBeVisible();

  await page.getByRole("tab", { name: "Novos lançamentos" }).click();
  await page.getByRole("tab", { name: "Todos os NFTs" }).click();

  await expect(page.getByRole("tab", { name: "Todos os NFTs" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("40 NFTs encontrados")).toBeVisible();
});
